# ANTIGRAVITY DESIGN PROMPT: COMPLETE UI/UX REDESIGN
## Color System + Page Layout + Component Redesigns

---

## 🎯 PROJECT SCOPE

**Complete redesign of PLANPRO user interface:**
- ✅ New color system (Teal/Purple/Lime theme)
- ✅ Navigation bar redesign
- ✅ Landing page hero improvements
- ✅ Product cards complete overhaul
- ✅ Collection page enhancements
- ✅ Product detail page layout
- ✅ Architect tool interface
- ✅ All supporting pages and sections

**Timeline: 24-32 days** (combining color + design work)  
**Deliverables: Complete redesigned website UI**

---

## PHASE 1: NAVIGATION & HEADER (Days 1-3)

### Task 1.1: Navigation Bar Redesign

**Current State:**
- Simple horizontal nav
- Basic logo
- Plain icons

**New Implementation:**

```html
<!-- Navigation Bar HTML Structure (Reference) -->
<nav class="navbar">
  <div class="nav-left">
    <div class="logo">
      <img src="logo.svg" />
      <span>PLANPRO</span>
    </div>
    <div class="nav-links">
      <a href="/" class="nav-link">Home</a>
      <a href="/collection" class="nav-link">Collection</a>
      <a href="/architect" class="nav-link bold">Architect Tool</a>
    </div>
  </div>
  
  <div class="nav-right">
    <input type="search" placeholder="Search products..." />
    <a href="/wishlist" class="icon-link">❤ <span class="badge">2</span></a>
    <a href="/cart" class="icon-link">🛒 <span class="badge">3</span></a>
    <a href="/profile" class="icon-link">👤</a>
    <button class="btn-login">LOG IN</button>
  </div>
</nav>
```

**CSS Implementation:**

```css
.navbar {
  background: #0F1B2E;
  border-bottom: 1px solid #2A3E54;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #FFFFFF;
  font-size: 16px;
}

.logo img {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 8px rgba(30, 187, 215, 0.2));
  transition: filter 0.2s ease;
}

.logo:hover img {
  filter: drop-shadow(0 0 12px rgba(30, 187, 215, 0.4));
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #FFFFFF;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding-bottom: 4px;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-link:hover {
  color: #1EBBD7;
  border-bottom-color: #1EBBD7;
}

.nav-link.active {
  color: #1EBBD7;
  border-bottom-color: #1EBBD7;
  font-weight: 600;
}

.nav-link.bold {
  font-weight: 700;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

input[type="search"] {
  width: 300px;
  background: #1A2E42;
  border: 1px solid #2A3E54;
  border-radius: 24px;
  padding: 10px 16px;
  color: #FFFFFF;
  font-size: 13px;
  transition: border-color 0.2s ease;
}

input[type="search"]:focus {
  outline: none;
  border-color: #1EBBD7;
  box-shadow: 0 0 0 3px rgba(30, 187, 215, 0.1);
}

input[type="search"]::placeholder {
  color: #5A6E84;
}

.icon-link {
  color: #FFFFFF;
  text-decoration: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.icon-link:hover {
  color: #1EBBD7;
}

.icon-link .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #1EBBD7;
  color: #0F1B2E;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 700;
}

.icon-link:nth-child(4) .badge {
  background: #9D4EDD;
  color: #FFFFFF;
}

.btn-login {
  background: #1EBBD7;
  color: #0F1B2E;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-login:hover {
  background: #00D9FF;
  box-shadow: 0 4px 12px rgba(30, 187, 215, 0.3);
}

/* Mobile Hamburger Menu */
@media (max-width: 768px) {
  .navbar {
    padding: 0 20px;
  }
  
  .nav-links {
    display: none; /* Hidden on mobile, shown in hamburger */
  }
  
  input[type="search"] {
    width: 200px;
  }
  
  .hamburger {
    display: block;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  
  .hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background: #FFFFFF;
    margin: 6px 0;
    transition: all 0.3s ease;
  }
}
```

**Testing Checklist for Task 1.1:**
- [ ] Logo glow on hover works
- [ ] Active page indicator is teal, bold
- [ ] Search bar focuses with teal border
- [ ] Wishlist badge shows correct count (teal)
- [ ] Cart badge shows correct count (purple)
- [ ] Login button has teal background + cyan hover
- [ ] All hover states smooth (0.2s)
- [ ] Mobile: hamburger menu appears < 768px
- [ ] Mobile: nav links in hamburger overlay
- [ ] Accessibility: Keyboard navigation works
- [ ] Accessibility: Focus rings visible

---

## PHASE 2: HERO SECTION & FEATURES (Days 4-6)

### Task 2.1: Hero Section Redesign

**CSS:**

```css
.hero {
  background: linear-gradient(135deg, #0F1B2E 0%, #1A2E42 100%);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}

/* Optional: Subtle background pattern */
.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 50px,
      rgba(30, 187, 215, 0.02) 50px,
      rgba(30, 187, 215, 0.02) 100px
    );
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 900px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-label {
  font-size: 12px;
  letter-spacing: 2px;
  color: #1EBBD7;
  font-weight: 600;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.hero-title {
  font-size: 56px;
  font-weight: 400;
  color: #FFFFFF;
  line-height: 1.2;
  margin-bottom: 12px;
  font-family: 'Georgia', serif; /* elegant serif */
}

.hero-subtitle {
  font-size: 16px;
  color: #B8D4D0;
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-features {
  font-size: 14px;
  letter-spacing: 1px;
  color: #1EBBD7;
  margin-bottom: 32px;
  font-weight: 500;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary-hero {
  background: #1EBBD7;
  color: #0F1B2E;
  border: none;
  padding: 14px 40px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary-hero:hover {
  background: #00D9FF;
  box-shadow: 0 8px 24px rgba(30, 187, 215, 0.4);
  transform: scale(1.04);
}

.btn-secondary-hero {
  background: transparent;
  border: 2px solid #1EBBD7;
  color: #1EBBD7;
  padding: 12px 40px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary-hero:hover {
  background: rgba(30, 187, 215, 0.1);
}

/* Mobile Hero */
@media (max-width: 768px) {
  .hero {
    min-height: 400px;
    padding: 40px 20px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-buttons {
    flex-direction: column;
  }
  
  .btn-primary-hero,
  .btn-secondary-hero {
    width: 100%;
  }
}
```

**Testing Checklist for Task 2.1:**
- [ ] Hero animates on page load (fade-in-up)
- [ ] Title is large, elegant serif, white
- [ ] Subheading is gray, readable
- [ ] Features label is teal, uppercase, spaced
- [ ] Buttons layout correctly (flex)
- [ ] Primary button is teal with cyan hover
- [ ] Secondary button has teal border + fill on hover
- [ ] Background gradient visible
- [ ] Pattern overlay subtle (barely visible)
- [ ] Mobile: Single column layout
- [ ] Mobile: Buttons full width
- [ ] Accessibility: Color contrast checked

---

## PHASE 3: PRODUCT CARDS (Days 7-11)

### Task 3.1: Complete Product Card Redesign

This is the most critical component. New card must include:
- Teal left border (4px)
- Feature badges (AR, Price Match)
- Improved price display
- Better buttons
- Smooth hover effects

**Card HTML Structure:**

```html
<div class="product-card">
  <div class="card-image">
    <img src="product.jpg" alt="Product" />
    
    <!-- Badges Container -->
    <div class="badges-container">
      <div class="badge badge-ar">AR AVAILABLE</div>
      <div class="badge badge-match">PRICE MATCHED</div>
    </div>
  </div>
  
  <div class="card-content">
    <div class="card-category">SOFAS</div>
    
    <h3 class="card-title">PLANPRO Recline sofa</h3>
    
    <p class="card-description">
      Premium sofa with reclining mechanism and adjustable backrest for ultimate comfort.
    </p>
    
    <div class="card-price">
      <span class="price-current">₹13,280</span>
      <span class="price-original">₹16,600</span>
      <span class="price-discount">↓ 20%</span>
    </div>
    
    <div class="card-buttons">
      <button class="btn-view-ar">
        <span>📱</span> VIEW IN AR
      </button>
      <button class="btn-add-cart">
        <span>🛒</span> ADD TO CART
      </button>
    </div>
    
    <button class="btn-wishlist">♡ Add to Wishlist</button>
  </div>
</div>
```

**CSS for Product Card:**

```css
.product-card {
  background: #1A2E42;
  border: 2px solid #2A3E54;
  border-left: 4px solid #1EBBD7; /* TEAL LEFT BORDER */
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease-out;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.product-card:hover {
  border: 2px solid #1EBBD7;
  box-shadow: 0 12px 32px rgba(30, 187, 215, 0.2);
  transform: translateY(-4px);
}

.product-card:hover .card-image img {
  transform: scale(1.05);
}

/* Image Container */
.card-image {
  width: 100%;
  height: 280px;
  background: #0F1B2E;
  position: relative;
  overflow: hidden;
  aspect-ratio: 1/1;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* Badges */
.badges-container {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.badge {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 14px;
  text-align: center;
}

.badge-ar {
  background: #1EBBD7;
  color: #0F1B2E;
}

.badge-match {
  background: #9D4EDD;
  color: #FFFFFF;
}

/* Content Area */
.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-category {
  font-size: 12px;
  color: #B8D4D0;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  font-size: 13px;
  color: #B8D4D0;
  line-height: 1.4;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.price-current {
  font-size: 18px;
  font-weight: 700;
  color: #FFFFFF;
}

.price-original {
  font-size: 14px;
  color: #B8D4D0;
  text-decoration: line-through;
}

.price-discount {
  margin-left: auto;
  color: #39FF14;
  font-weight: 600;
  font-size: 12px;
}

/* Buttons */
.card-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.btn-view-ar,
.btn-add-cart {
  flex: 1;
  padding: 12px 16px;
  font-weight: 600;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-view-ar {
  background: #1EBBD7;
  color: #0F1B2E;
}

.btn-view-ar:hover {
  background: #00D9FF;
  box-shadow: 0 6px 16px rgba(30, 187, 215, 0.3);
}

.btn-add-cart {
  background: transparent;
  border: 2px solid #1EBBD7;
  color: #1EBBD7;
}

.btn-add-cart:hover {
  background: rgba(30, 187, 215, 0.1);
}

/* Wishlist Button */
.btn-wishlist {
  background: none;
  border: none;
  color: #1EBBD7;
  font-size: 13px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-wishlist:hover {
  color: #00D9FF;
}

/* Mobile Card Layout */
@media (max-width: 768px) {
  .product-card {
    display: grid;
    grid-template-columns: 40% 60%;
    gap: 0;
  }
  
  .card-image {
    height: 200px;
  }
  
  .card-content {
    padding: 12px;
  }
  
  .card-buttons {
    flex-direction: column;
  }
}
```

**Animation for Pulse (Optional, AR Button Only):**

```css
.btn-view-ar {
  animation: pulse-subtle 2s infinite;
}

@keyframes pulse-subtle {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.btn-view-ar:hover {
  animation-duration: 1.5s;
}
```

**Testing Checklist for Task 3.1:**
- [ ] Card has teal 4px left border
- [ ] Hover state: border becomes full teal
- [ ] Hover state: shadow increases
- [ ] Hover state: card lifts slightly (4px)
- [ ] Image zooms on hover (1.05x)
- [ ] AR badge appears (teal, top-right)
- [ ] Price match badge appears (purple, if matched)
- [ ] Price display: current bold/white, original gray strikethrough
- [ ] Discount percentage: lime green, right-aligned
- [ ] "VIEW IN AR" button: teal, cyan on hover
- [ ] "ADD TO CART" button: teal outline, fill on hover
- [ ] Wishlist link: teal text, underline
- [ ] Pulse animation on AR button (optional)
- [ ] Mobile: Horizontal layout (image left, content right)
- [ ] All buttons responsive to clicks
- [ ] Accessibility: Colors meet WCAG AA

---

## PHASE 4: COLLECTION PAGE (Days 12-16)

### Task 4.1: Collection Page Header & Filters

**Collection Page Header CSS:**

```css
.collection-header {
  background: #0F1B2E;
  padding: 48px 40px;
  border-bottom: 1px solid #2A3E54;
}

.collection-title {
  font-size: 42px;
  font-weight: 400;
  color: #FFFFFF;
  margin: 0 0 12px 0;
  font-family: 'Georgia', serif;
}

.collection-subtitle {
  font-size: 16px;
  color: #B8D4D0;
  margin-bottom: 32px;
}

.collection-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
  background: #1A2E42;
  border: 1px solid #2A3E54;
  border-radius: 24px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 13px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1EBBD7;
}

.filter-button {
  background: transparent;
  border: 1px solid #2A3E54;
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  border-color: #1EBBD7;
  color: #1EBBD7;
}

/* Filter Pills */
.filter-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 24px 0;
}

.filter-pill {
  background: transparent;
  border: 1px solid #2A3E54;
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 13px;
}

.filter-pill:hover {
  border-color: #1EBBD7;
  color: #1EBBD7;
}

.filter-pill.active {
  background: #1EBBD7;
  color: #0F1B2E;
  border-color: #1EBBD7;
  font-weight: 600;
}
```

**Testing Checklist for Task 4.1:**
- [ ] Page title displays correctly
- [ ] Search bar functional and styled
- [ ] Search bar focus: teal border
- [ ] Filter button shows on hover
- [ ] Filter pills layout correctly
- [ ] Active filter pill: teal background, dark text
- [ ] Inactive pills: gray border, white text
- [ ] Pill hover: border becomes teal
- [ ] All controls responsive

---

## PHASE 5: PRODUCT DETAIL PAGE (Days 17-20)

### Task 5.1: Product Detail Layout

**Product Detail CSS:**

```css
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  padding: 40px;
  background: #0F1B2E;
  min-height: 100vh;
}

.back-button {
  grid-column: 1 / -1;
  color: #1EBBD7;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 24px;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #00D9FF;
}

/* Image Gallery */
.detail-gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-image {
  width: 100%;
  aspect-ratio: 1/1;
  background: #1A2E42;
  border: 2px solid #2A3E54;
  border-radius: 12px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image:hover img {
  transform: scale(1.05);
}

.thumbnail-gallery {
  display: flex;
  gap: 12px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  background: #1A2E42;
  border: 2px solid #2A3E54;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: #1EBBD7;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Info Section */
.detail-info {
  display: flex;
  flex-direction: column;
}

.detail-category {
  font-size: 12px;
  color: #B8D4D0;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 8px;
}

.detail-title {
  font-size: 32px;
  font-weight: 400;
  color: #FFFFFF;
  margin-bottom: 16px;
  line-height: 1.3;
}

.detail-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.stars {
  color: #1EBBD7;
  font-size: 16px;
}

.review-count {
  color: #B8D4D0;
}

/* Price Section */
.detail-price {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.price-current {
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
}

.price-original {
  font-size: 16px;
  color: #B8D4D0;
  text-decoration: line-through;
}

.price-discount {
  color: #39FF14;
  font-weight: 600;
}

/* Specifications Grid */
.detail-specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  padding: 24px 0;
  border-top: 1px solid #2A3E54;
  border-bottom: 1px solid #2A3E54;
}

.spec-item {
  display: flex;
  flex-direction: column;
}

.spec-label {
  font-size: 12px;
  color: #B8D4D0;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.spec-value {
  font-size: 14px;
  color: #FFFFFF;
  font-weight: 500;
}

/* Description */
.detail-description {
  font-size: 14px;
  color: #B8D4D0;
  line-height: 1.6;
  margin-bottom: 24px;
}

.detail-features {
  list-style: none;
  margin: 0 0 24px 0;
  padding: 0;
}

.detail-features li {
  color: #FFFFFF;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.detail-features li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #1EBBD7;
  font-weight: bold;
}

/* Action Buttons */
.detail-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-actions button {
  flex: 1;
  padding: 14px;
  font-weight: 600;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s ease;
}

.btn-view-ar-detail {
  background: #1EBBD7;
  color: #0F1B2E;
}

.btn-view-ar-detail:hover {
  background: #00D9FF;
  box-shadow: 0 8px 20px rgba(30, 187, 215, 0.3);
}

.btn-add-cart-detail {
  background: transparent;
  border: 2px solid #1EBBD7;
  color: #1EBBD7;
}

.btn-add-cart-detail:hover {
  background: rgba(30, 187, 215, 0.1);
}

/* Additional Options */
.detail-options {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 24px 0;
  border-bottom: 1px solid #2A3E54;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-selector label {
  color: #B8D4D0;
  font-size: 14px;
}

.quantity-selector select {
  background: #1A2E42;
  border: 1px solid #2A3E54;
  color: #FFFFFF;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.wishlist-link {
  color: #1EBBD7;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.wishlist-link:hover {
  color: #00D9FF;
}

.stock-status {
  margin-left: auto;
  font-size: 14px;
  font-weight: 600;
  color: #39FF14;
}

/* Tabs */
.detail-tabs {
  grid-column: 1 / -1;
  margin-top: 48px;
  padding-top: 48px;
  border-top: 1px solid #2A3E54;
}

.tab-headers {
  display: flex;
  gap: 32px;
  border-bottom: 2px solid #2A3E54;
  margin-bottom: 24px;
}

.tab-header {
  font-size: 16px;
  color: #FFFFFF;
  border-bottom: 3px solid transparent;
  padding-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.tab-header:hover {
  color: #1EBBD7;
}

.tab-header.active {
  color: #1EBBD7;
  border-bottom-color: #1EBBD7;
  font-weight: 600;
}

.tab-content {
  font-size: 14px;
  color: #B8D4D0;
  line-height: 1.6;
  display: none;
}

.tab-content.active {
  display: block;
}

/* Mobile Layout */
@media (max-width: 1000px) {
  .product-detail {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .back-button {
    grid-column: 1;
  }
  
  .detail-specs {
    grid-template-columns: 1fr;
  }
  
  .detail-actions {
    flex-direction: column;
  }
  
  .detail-actions button {
    width: 100%;
  }
}
```

**Testing Checklist for Task 5.1:**
- [ ] Back button functional and styled
- [ ] Main image displays, zooms on hover
- [ ] Thumbnails clickable, active thumbnail has teal border
- [ ] Category label visible (gray, small)
- [ ] Title large and elegant
- [ ] Rating with teal stars displays
- [ ] Price: current bold white, original strikethrough gray
- [ ] Discount percentage in lime green
- [ ] Specs in 2-column grid
- [ ] Description readable, features bulleted
- [ ] "VIEW IN AR" button prominent (teal)
- [ ] "ADD TO CART" button outlined (teal border)
- [ ] Buttons hover correctly
- [ ] Quantity selector functional
- [ ] Stock status shows in lime green
- [ ] Tabs clickable, active tab has teal underline
- [ ] Mobile: Single column layout
- [ ] Related products section displays below

---

## PHASE 6: ARCHITECT TOOL (Days 21-24)

### Task 6.1: Architect Tool Sidebar Redesign

**Architect Tool Sidebar CSS:**

```css
.architect-sidebar {
  width: 280px;
  background: #1A2E42;
  border-right: 1px solid #2A3E54;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 20px;
}

.architect-header {
  margin-bottom: 24px;
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.carpet-area {
  font-size: 12px;
  color: #B8D4D0;
  letter-spacing: 1px;
}

.carpet-area-value {
  font-size: 14px;
  color: #FFFFFF;
  font-weight: 600;
}

/* Tabs */
.architect-tabs {
  display: flex;
  border-bottom: 2px solid #2A3E54;
  margin-bottom: 20px;
}

.architect-tab {
  flex: 1;
  background: transparent;
  border: none;
  color: #FFFFFF;
  padding: 12px 16px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 13px;
}

.architect-tab:hover {
  border-bottom-color: #1EBBD7;
  color: #1EBBD7;
}

.architect-tab.active {
  background: #1EBBD7;
  color: #0F1B2E;
  border-bottom-color: #1EBBD7;
  font-weight: 600;
}

/* Collections Dropdown */
.collections-label {
  font-size: 12px;
  color: #B8D4D0;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 12px;
}

.collections-dropdown {
  background: #1A2E42;
  border: 1px solid #2A3E54;
  color: #FFFFFF;
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  margin-bottom: 16px;
  transition: border-color 0.2s ease;
}

.collections-dropdown:focus {
  outline: none;
  border-color: #1EBBD7;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.collection-item {
  aspect-ratio: 1/1;
  background: #0F1B2E;
  border: 1px solid #2A3E54;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collection-item:hover {
  border-color: #1EBBD7;
  box-shadow: 0 0 12px rgba(30, 187, 215, 0.2);
  transform: scale(1.05);
}

.collection-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Inventory Section */
.inventory-section {
  background: rgba(30, 187, 215, 0.05);
  border: 1px solid #2A3E54;
  border-radius: 8px;
  padding: 16px;
  margin-top: auto;
}

.inventory-label {
  font-size: 12px;
  color: #B8D4D0;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 8px;
}

.statement-total {
  font-size: 28px;
  font-weight: 700;
  color: #39FF14; /* Lime green when price matched */
  margin-bottom: 12px;
  transition: color 0.3s ease;
}

.inventory-link {
  color: #1EBBD7;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;
}

.inventory-link:hover {
  color: #00D9FF;
}

/* Main Canvas */
.architect-canvas {
  flex: 1;
  background: linear-gradient(135deg, #0F1B2E 0%, #0F1B2E 100%);
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 19px,
      rgba(30, 187, 215, 0.03) 19px,
      rgba(30, 187, 215, 0.03) 20px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 19px,
      rgba(30, 187, 215, 0.03) 19px,
      rgba(30, 187, 215, 0.03) 20px
    );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.canvas-3d {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, #1A2E42 0%, #0F1B2E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Canvas Controls */
.canvas-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
}

.cinema-view-btn {
  background: transparent;
  border: 2px solid #1EBBD7;
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.cinema-view-btn:hover {
  background: #1EBBD7;
  color: #0F1B2E;
}

/* Tool Icons */
.tool-icons {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-icon {
  width: 44px;
  height: 44px;
  background: transparent;
  border: 1px solid #2A3E54;
  border-radius: 8px;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
}

.tool-icon:hover {
  border-color: #1EBBD7;
  background: #1A2E42;
}

/* Status Text */
.canvas-status {
  position: absolute;
  bottom: 16px;
  left: 16px;
  font-size: 11px;
  color: #B8D4D0;
  letter-spacing: 1px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

**Testing Checklist for Task 6.1:**
- [ ] Sidebar layout is vertical (280px wide)
- [ ] Project title displays correctly
- [ ] Carpet area label visible
- [ ] Tabs switch between APPEARANCE/LIBRARY
- [ ] Active tab: teal background, dark text
- [ ] Collections dropdown functional
- [ ] Collection items: 2-column grid, clickable
- [ ] Collection hover: teal border, glow
- [ ] Inventory section shows at bottom
- [ ] Statement total displays (lime green if matched)
- [ ] "View Details" link functional
- [ ] Canvas background: subtle grid pattern
- [ ] CINEMA VIEW button: teal border, hover fill
- [ ] Tool icons: right side, teal on hover
- [ ] Status text pulses at bottom
- [ ] Mobile: Sidebar as overlay/bottom sheet

---

## PHASE 7: FOOTER & SUPPORTING PAGES (Days 25-28)

### Task 7.1: Footer Redesign

**Footer CSS:**

```css
.footer {
  background: #0F1B2E;
  border-top: 1px solid #2A3E54;
  padding: 60px 40px 20px;
  color: #B8D4D0;
  margin-top: 80px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  margin-bottom: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid #2A3E54;
}

/* Logo Section */
.footer-brand {
  display: flex;
  flex-direction: column;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #FFFFFF;
  font-weight: 600;
}

.footer-tagline {
  font-size: 13px;
  color: #B8D4D0;
  margin-bottom: 16px;
  line-height: 1.6;
}

.social-icons {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid #2A3E54;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.social-icon:hover {
  border-color: #1EBBD7;
  color: #1EBBD7;
}

/* Newsletter Section */
.footer-newsletter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.newsletter-title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 12px;
}

.newsletter-subtitle {
  font-size: 13px;
  color: #B8D4D0;
  margin-bottom: 16px;
}

.newsletter-form {
  display: flex;
  gap: 8px;
}

.newsletter-input {
  background: #1A2E42;
  border: 1px solid #2A3E54;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  width: 280px;
  font-size: 13px;
  transition: border-color 0.2s ease;
}

.newsletter-input:focus {
  outline: none;
  border-color: #1EBBD7;
}

.newsletter-button {
  background: #1EBBD7;
  color: #0F1B2E;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.newsletter-button:hover {
  background: #00D9FF;
  box-shadow: 0 4px 12px rgba(30, 187, 215, 0.3);
}

/* Footer Links Section */
.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 80px;
  margin-bottom: 48px;
}

.footer-column h3 {
  font-size: 12px;
  letter-spacing: 1px;
  font-weight: 700;
  color: #1EBBD7;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.footer-column ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-column li {
  margin-bottom: 12px;
}

.footer-column a {
  color: #B8D4D0;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s ease;
}

.footer-column a:hover {
  color: #1EBBD7;
}

/* Footer Bottom */
.footer-bottom {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #2A3E54;
  font-size: 12px;
  color: #5A6E84;
}

/* Mobile Footer */
@media (max-width: 768px) {
  .footer {
    padding: 40px 20px;
  }
  
  .footer-top {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .footer-newsletter {
    align-items: flex-start;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
  
  .newsletter-input {
    width: 100%;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
```

**Testing Checklist for Task 7.1:**
- [ ] Footer background is dark navy
- [ ] Logo and tagline visible
- [ ] Social icons styled with borders, hover teal
- [ ] Newsletter section on right (desktop)
- [ ] Newsletter input and button functional
- [ ] Newsletter button teal with cyan hover
- [ ] Footer links in 3 columns
- [ ] Column headers teal, uppercase, spaced
- [ ] Links hover teal color
- [ ] Copyright text at bottom
- [ ] Mobile: Single column layout
- [ ] Mobile: Newsletter section stacks

---

## PHASE 8: FORMS & MODALS (Days 29-30)

### Task 8.1: Form Elements

**Form CSS:**

```css
input[type="text"],
input[type="email"],
input[type="password"],
textarea,
select {
  background: #1A2E42;
  border: 1px solid #2A3E54;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  width: 100%;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #1EBBD7;
  box-shadow: 0 0 0 3px rgba(30, 187, 215, 0.1);
}

input::placeholder {
  color: #5A6E84;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

/* Checkboxes */
input[type="checkbox"],
input[type="radio"] {
  accent-color: #1EBBD7;
  cursor: pointer;
}

label {
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
  cursor: pointer;
}

/* Error States */
input.error {
  border-color: #FF6B6B;
}

input.error:focus {
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.error-message {
  color: #FF6B6B;
  font-size: 12px;
  margin-top: 4px;
}

/* Success States */
input.success {
  border-color: #39FF14;
}

input.success:focus {
  box-shadow: 0 0 0 3px rgba(57, 255, 20, 0.1);
}

.success-message {
  color: #39FF14;
  font-size: 12px;
  margin-top: 4px;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #1A2E42;
  border: 2px solid #2A3E54;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  font-size: 24px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 24px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #FFFFFF;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: #1EBBD7;
}
```

**Testing Checklist for Task 8.1:**
- [ ] Form inputs have dark background (#1A2E42)
- [ ] Form inputs have gray borders (#2A3E54)
- [ ] Focus state: teal border + subtle glow
- [ ] Checkboxes: teal when checked
- [ ] Error state: red border
- [ ] Success state: green border
- [ ] Error messages display in red
- [ ] Success messages display in green
- [ ] Modals fade in smoothly
- [ ] Modal close button functional
- [ ] All forms responsive

---

## FINAL INTEGRATION & TESTING (Days 31-32)

### Task 9.1: Cross-Browser & Accessibility Testing

**Testing Checklist:**

**Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Responsive Design:**
- [ ] Desktop (1200px+)
- [ ] Tablet (768px-1199px)
- [ ] Mobile (375px-767px)
- [ ] Small mobile (<375px)

**Color Accessibility:**
- [ ] WCAG AA contrast verified (4.5:1 minimum)
- [ ] WCAG AAA verified for critical elements
- [ ] Color blindness simulator (Deuteranopia, Protanopia)
- [ ] No information conveyed by color alone

**Keyboard Navigation:**
- [ ] Tab navigation works on all pages
- [ ] Enter activates buttons
- [ ] Escape closes modals
- [ ] Focus indicators visible (teal rings)
- [ ] Skip to main content link

**Performance:**
- [ ] Page load < 3 seconds
- [ ] No janky animations
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] Lighthouse score > 85

**User Testing:**
- [ ] Test with 10-15 real users
- [ ] Gather feedback on colors
- [ ] Test AR button discoverability
- [ ] Test price match feature visibility
- [ ] Monitor engagement metrics

---

## DELIVERABLES

Upon completion, provide:

1. **Updated Website Code**
   - All HTML updated
   - All CSS updated with new color system
   - JavaScript for interactivity (if needed)
   - Mobile-responsive versions

2. **Component Library**
   - All button states
   - All input states
   - All card variations
   - Modal examples
   - Navigation states

3. **Style Guide Document**
   - Color palette with hex values
   - Typography specifications
   - Spacing guidelines
   - Component patterns
   - CSS variable definitions

4. **Testing Report**
   - Browser compatibility matrix
   - Mobile responsiveness verification
   - Accessibility audit (WCAG AA/AAA)
   - Performance metrics
   - User testing feedback

5. **Before/After Screenshots**
   - 10-15 key page comparisons
   - Mobile views
   - Hover/focus states
   - Dark theme examples

6. **Implementation Guide**
   - Installation instructions
   - Configuration options
   - Deployment checklist
   - Rollback procedures

---

## SUCCESS CRITERIA

✅ **Design Implementation:**
- All 10 page sections redesigned
- New color system applied globally
- All components restyled

✅ **Color System:**
- Teal (#1EBBD7) on all primary CTAs
- Purple (#9D4EDD) on AI/price match features
- Lime green (#39FF14) on savings/success
- Cyan (#00D9FF) on all hover states

✅ **User Experience:**
- Increased AR button prominence
- Price matching clearly communicated
- Room generation featured
- Smoother interactions

✅ **Accessibility:**
- WCAG AAA compliance
- Color contrast verified
- Keyboard navigation working
- Focus indicators visible

✅ **Performance:**
- No visual regressions
- Smooth animations (no jank)
- Fast load times
- Mobile optimized

---

## SUPPORT & QUESTIONS

**Reference Documents:**
- DESIGN_CHANGES_ALL_PAGES.md - Detailed styling for each component
- WIREFRAMES_LAYOUT_GUIDE.md - Visual layouts and spacing
- QUICK_START_GUIDE.md - Color hex values
- COLOR_VISUAL_REFERENCE.md - Component examples

---

**Ready to Transform PLANPRO's User Interface!**

