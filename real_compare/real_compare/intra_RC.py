import json
import math
import re

# ---------- Load Data ----------
with open("intents.json", encoding="utf-8") as f:
    INTENTS = json.load(f)

with open("planpro_data_2.json", encoding="utf-8") as f:
    PLANPRO = json.load(f)

# ---------- Helpers ----------
def normalize(text):
    return re.sub(r"[^a-z0-9\s]", "", text.lower())

def parse_price(p):
    try:
        return float(p)
    except:
        return 0.0

def parse_rating(r):
    try:
        return float(r)
    except:
        return 0.0


# ---------- Catalogue Index Map ----------
def build_catalogue_index(catalogue):
    index = {}
    for p in catalogue:
        pid = p.get("ID") or p.get("id")
        if pid:
            index[str(pid).lower()] = p
    return index


# ---------- Wishlist Builder ----------
def build_wishlist_from_indexes(catalogue, wishlist_indexes):
    index_map = build_catalogue_index(catalogue)
    wishlist = []

    for idx in wishlist_indexes:
        key = idx.strip().lower()
        if key in index_map:
            wishlist.append(index_map[key])
        else:
            print(f"⚠️ Invalid index ignored: {idx}")

    return wishlist


# ---------- Intent Extraction ----------
def extract_intent(user_text):
    text = normalize(user_text)

    intent = {
        "action": None,
        "product_type": None,
        "constraints": {},
        "material": [],
        "style": [],
        "usage": [],
        "signals": []
    }

    # ---- ACTION ----
    for k, phrases in INTENTS["action"].items():
        if any(p in text for p in phrases):
            intent["action"] = k

    # default fallback action
    if not intent["action"]:
        intent["action"] = "recommend"

    # ---- PRODUCT TYPE (HIERARCHY BASED) ----
    hierarchy = INTENTS.get("product_hierarchy", {})

    detected_type = None
    detected_subtype = None

    for main_type, data in hierarchy.items():

        # Check subtype first (stronger match)
        for subtype, keywords in data.get("subtypes", {}).items():
            if any(kw in text for kw in keywords):
                detected_type = main_type
                detected_subtype = subtype
                break

        # If subtype matched, stop
        if detected_subtype:
            break

        # Otherwise check main type keywords
        if any(kw in text for kw in data.get("keywords", [])):
            detected_type = main_type

    # Combine into readable label
    if detected_type and detected_subtype:
        intent["product_type"] = f"{detected_subtype} {detected_type}"
    elif detected_type:
        intent["product_type"] = detected_type

    # ---- CONSTRAINTS ----
    for cat, values in INTENTS["constraints"].items():
        for k, phrases in values.items():
            if any(p in text for p in phrases):
                intent["constraints"][cat] = k

    # ---- OTHER GROUPS ----
    for group in ["material", "style", "usage"]:
        for k, phrases in INTENTS[group].items():
            if any(p in text for p in phrases):
                intent[group].append(k)

    for k, phrases in INTENTS["decision_signals"].items():
        if any(p in text for p in phrases):
            intent["signals"].append(k)

    return intent


# ---------- DISPLAY CLEAN INTENT ----------
def format_intent_for_display(intent):
    formatted = intent.copy()

    for key in ["material", "style", "usage", "signals"]:
        if not formatted[key]:
            formatted[key] = "NA"

    if not formatted["product_type"]:
        formatted["product_type"] = "NA"

    if not formatted["constraints"]:
        formatted["constraints"] = "NA"

    return formatted


# ---------- FILTER + BASE SCORING (SOFT SCORING - always rank all wishlist items) ----------
def recommend(wishlist, intent):
    scored = []

    for p in wishlist:
        score = 0

        subtype = normalize((p.get("SubType") or "").replace("_", " "))
        product_type = normalize(p.get("Type") or "")
        name = normalize(p.get("Name") or "")
        description = normalize(p.get("Description") or "")

        # -------- PRODUCT TYPE MATCHING (SOFT - adds points, does not eliminate) --------
        if intent["product_type"]:
            query_pt = normalize(intent["product_type"])
            parts = query_pt.split()

            # Check if any part of the intent type appears in product fields
            for part in parts:
                if part in product_type:
                    score += 3
                elif part in subtype:
                    score += 4
                elif part in name:
                    score += 2
                elif part in description:
                    score += 1

        # -------- MATERIAL (soft) --------
        if intent["material"]:
            material = normalize(p.get("Material") or "")
            if isinstance(intent["material"], list):
                if any(m in material for m in intent["material"]):
                    score += 1
            elif intent["material"] in material:
                score += 1

        # -------- STYLE (soft) --------
        if intent["style"]:
            style = normalize(p.get("Style") or "")
            if isinstance(intent["style"], list):
                if any(s in style or s in name or s in description for s in intent["style"]):
                    score += 1
            elif intent["style"] in style or intent["style"] in name:
                score += 1

        # -------- USAGE / SIGNALS --------
        if intent.get("signals"):
            for sig in intent["signals"]:
                if sig in name or sig in description:
                    score += 1

        # -------- CONSTRAINT: price ceiling --------
        if intent.get("constraints") and intent["constraints"].get("price"):
            price_cat = intent["constraints"]["price"]
            item_price = float(p.get("Price") or 0)
            # bonus for being within the implied price range
            if price_cat in ("very_low", "budget") and item_price < 15000:
                score += 1
            elif price_cat == "mid" and 15000 <= item_price < 30000:
                score += 1
            elif price_cat in ("high", "premium") and item_price >= 30000:
                score += 1

        # Always include item in results (soft scoring — never exclude)
        scored.append((p, score))

    return scored


# ---------- FINAL COMPARISON (PRICE + RATING) ----------
def compare(recommended):
    results = []

    MAX_PRICE = 200000.0
    MAX_RATING = 5.0

    for p, base_score in recommended:
        price = parse_price(p.get("Price"))
        rating = parse_rating(p.get("Rating"))

        # Lower price = higher score
        price_score = math.log(MAX_PRICE / price + 1) if price > 0 else 0

        # Higher rating = higher score
        rating_score = (rating / MAX_RATING) * 2 if rating > 0 else 0

        final_score = (
            base_score * 3
            + price_score * 1.5
            + rating_score * 2
        )

        results.append({
            "id": p.get("ID"),
            "name": p.get("Name"),
            "price": price,
            "rating": rating,
            "final_score": round(final_score, 3)
        })

    return sorted(results, key=lambda x: x["final_score"], reverse=True)


# ---------- PIPELINE ----------
def intra_recommend_compare(user_text, wishlist):
    intent = extract_intent(user_text)
    recommended = recommend(wishlist, intent)

    if not recommended:
        return {
            "intent": intent,
            "results": []
        }

    compared = compare(recommended)

    return {
        "intent": intent,
        "results": compared
    }


# ---------- CLI RUNNER ----------
if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(description='PlanPro Intra-Site Recommender')
    parser.add_argument('--ids', type=str, help='Comma-separated product IDs', default=None)
    parser.add_argument('--query', type=str, help='User query string', default=None)
    args, unknown = parser.parse_known_args()

    # --- NON-INTERACTIVE MODE (called from backend) ---
    if args.ids and args.query:
        wishlist_indexes = [i.strip() for i in args.ids.split(',')]
        wishlist = build_wishlist_from_indexes(PLANPRO, wishlist_indexes)

        if not wishlist:
            print("ERROR: Wishlist is empty after validation.")
            sys.exit(1)

        output = intra_recommend_compare(args.query, wishlist)

        print("\nDetected Intent:")
        print(json.dumps(format_intent_for_display(output["intent"]), indent=2))

        if not output["results"]:
            print("\nNo matching products found in your wishlist.")
            sys.exit(0)

        print("\n\U0001f3c6 Ranked Products:\n")
        for idx, r in enumerate(output["results"], start=1):
            rating_str = f"\u2b50 {r['rating']}" if r["rating"] else "\u2b50 N/A"
            print(f"{idx}. {r['id']} | {r['name']} | \u20b9{r['price']} | {rating_str} | score={r['final_score']}")

    # --- INTERACTIVE MODE (fallback for manual testing) ---
    else:
        print("\n\U0001f916 AssistoBot \u2013 Intra Recommender & Comparer\n")

        # ---- STEP 1: WISHLIST INPUT ----
        raw_indexes = input(
            "Enter product indexes for your wishlist (comma separated)\n"
            "Example: x1,x4,x9\n> "
        ).strip()

        if not raw_indexes:
            print("\u274c No wishlist provided.")
            sys.exit()

        wishlist_indexes = raw_indexes.split(",")
        wishlist = build_wishlist_from_indexes(PLANPRO, wishlist_indexes)

        if not wishlist:
            print("\u274c Wishlist is empty after validation.")
            sys.exit()

        print(f"\n\u2705 Wishlist created with {len(wishlist)} items.\n")

        # ---- STEP 2: USER QUERY ----
        user_text = input("What are you looking for?\n> ").strip()

        if not user_text:
            print("\u274c No input provided.")
            sys.exit()

        output = intra_recommend_compare(user_text, wishlist)

        print("\n\U0001f9e0 Detected Intent:")
        print(json.dumps(format_intent_for_display(output["intent"]), indent=2))

        if not output["results"]:
            print("\n\u274c No matching products found in your wishlist.")
            sys.exit()

        print("\n\U0001f3c6 Ranked Products:\n")

        for idx, r in enumerate(output["results"], start=1):
            rating_str = f"\u2b50 {r['rating']}" if r["rating"] else "\u2b50 N/A"
            print(
                f"{idx}. {r['id']} | {r['name']} | \u20b9{r['price']} | {rating_str} | score={r['final_score']}"
            )