# ANTIGRAVITY AGENT PROMPT: PLANPRO DESIGN SYSTEM UPGRADE

## PROJECT SCOPE
Update PLANPRO website design system with new color palette and UX improvements. PLANPRO is an e-commerce + AR + Room Generation + AI-Based Price Matching platform for premium furniture.

---

## PHASE 1: COLOR SYSTEM UPDATE (PRIORITY)

### New Color Palette Implementation

#### Primary Colors
```
Background Color (Primary): #0F1B2E (Midnight Blue)
- Replace current navy (#1A2A47) globally
- Maintain same contrast ratios for accessibility
- Apply to: Page background, hero sections, full-width areas

Primary Accent Color: #1EBBD7 (Teal)
- Replace soft mint/lavender accents
- Use for: All primary CTAs, AR feature highlights, interactive states
- Applies to: "View in AR" buttons, AR-enabled product badges

Secondary Accent (Tech/AI): #9D4EDD (Electric Purple)
- New color for AI-related features
- Use for: Price match guarantee badges, AI feature labels, data visualization
- Applies to: "Price Match" indicators, AI suggestion highlights

Success/Positive State: #39FF14 (Bright Lime Green)
- Savings confirmation, success messages, positive validations
- Use for: "Price matched!", discount badges, confirmation states

Highlight/Hover: #00D9FF (Cyan - brighter teal)
- Interactive element highlights
- Use for: Button hover states, link focus states, feature highlights
```

#### Text & Supporting Colors
```
Primary Text: #FFFFFF (White)
- Keep current white text on dark backgrounds
- Maintain readability, all current text remains

Secondary Text: #B8D4D0 (Keep existing light gray/teal)
- For secondary information
- Keep current implementation

Background Cards: #1A2E42 (Slightly lighter than background)
- Product cards, service cards, modal backgrounds
- Slight elevation from main background

Border Colors:
- Light borders: #2A3E54 (subtle dark blue-gray)
- Accent borders: #1EBBD7 (teal for emphasis)
- Focus borders: #00D9FF (cyan for active states)
```

### Global Color Replacements (Find & Replace)
```
FIND: #1A2A47 (old navy) → REPLACE WITH: #0F1B2E
FIND: #D4C4E8 (lavender buttons) → REPLACE WITH: #1EBBD7
FIND: Current mint accent → REPLACE WITH: #1EBBD7 (where used for CTAs)
FIND: Yellow/gold labels (#E8D57E or similar) → KEEP but reduce opacity by 20%
```

---

## PHASE 2: COMPONENT-SPECIFIC UPDATES

### Navigation Bar
**Changes:**
- Active page indicator: Change from subtle underline to solid bar (accent color #1EBBD7)
- "Architect Tool" link: Make bold/heavier font weight (+200 weight)
- Hover states: Text color remains white, add subtle background highlight in #1A2E42
- Logo badge: Keep design, ensure it pops against new background

### Hero Section ("Services we provide")
**Changes:**
- Background: #0F1B2E (already specified above)
- "OUR EXPERTISE" label: Keep color, verify contrast
- Main heading: Increase font size by 15-20%, keep white
- Description text: Keep current styling

### Service Cards (3-column section)
**Changes:**
- Card background: #1A2E42
- Card border: Add 1px border in #2A3E54
- On hover: Add 2px border in #1EBBD7 (accent color)
- Shadow on hover: Increase elevation (more prominent shadow)
- "LEARN MORE" button: 
  - Background: #1EBBD7
  - Text: #0F1B2E (dark text on teal)
  - On hover: Background becomes #00D9FF

### "Featured Collection" Section
**Changes:**
- Background: #0F1B2E
- Category filter pills (ALL, TABLES, SOFAS, STORAGE, etc.):
  - Default: Border #2A3E54, text white
  - Active/Selected: Background #1EBBD7, text #0F1B2E, font-weight bold
  - Hover: Border #1EBBD7
- "REFINE SELECTION" dropdown: Border color #2A3E54
- Search bar: Border #2A3E54, focus border #1EBBD7

### Product Cards
**NEW DESIGN:**
- Card layout: Keep current, add left border
- Left border: 3px solid #1EBBD7 (accent color)
- Card background: #1A2E42
- Card border (all sides): 1px #2A3E54
- On hover:
  - Box shadow: Increase from current to `0 12px 32px rgba(30, 187, 215, 0.15)`
  - Border: Change to #1EBBD7
  - Slight scale up (1.02x)
  
**Product Badge (NEW):**
- Add badge top-right if AR enabled: "AR AVAILABLE"
  - Background: #1EBBD7
  - Text: #0F1B2E
  - Font size: 10px, font-weight: bold
  - Padding: 4px 8px

- Add badge for price matched: "PRICE MATCHED"
  - Background: #9D4EDD
  - Text: #FFFFFF
  - Font size: 10px, font-weight: bold

- Keep heart/wishlist icon styling (white stroke)

**Price section:**
- Keep gold/yellow badge styling
- Price text: Keep white
- Product name: Keep white
- Add small savings indicator if applicable: "Save X%"
  - Color: #39FF14 (lime green)
  - Font-weight: bold

### "Architect Tool" (Room Generation)
**Changes:**
- Background: #0F1B2E
- Left sidebar: Keep #1A2E42 background
- "APPEARANCE" / "LIBRARY" tabs:
  - Active tab: Background #1EBBD7, text #0F1B2E, bold
  - Inactive tab: Border #2A3E54, text white
  - Hover: Border #1EBBD7
  
- Collections dropdown: Border #2A3E54, focus border #1EBBD7
- Grid floor pattern: Keep white/light gray gridlines
- "CINEMA VIEW" button:
  - Text: Keep white
  - Border: #1EBBD7
  - On hover: Background #1EBBD7, text #0F1B2E
  
- Right-side tool icons (layers, settings): 
  - Icon color: white
  - Border: #2A3E54
  - On hover: Border #1EBBD7, background #1A2E42

**Inventory status section:**
- "STATEMENT TOTAL": Keep styling
- Price display: Lime green (#39FF14) if price matched, white if not
- "CLICK TO VIEW DETAILED RECEIPT": Make teal link with underline #1EBBD7

---

## PHASE 3: INTERACTIVE ELEMENTS

### All Buttons
**Primary CTA Buttons:**
```
Default:
  - Background: #1EBBD7
  - Text: #0F1B2E (dark text for contrast)
  - Font-weight: 600
  - Border: None
  - Border-radius: 24px (keep current roundness)

Hover:
  - Background: #00D9FF (brighter cyan)
  - Slight scale: 1.04x
  - Box-shadow: 0 8px 20px rgba(30, 187, 215, 0.4)

Active/Pressed:
  - Background: #1EBBD7
  - Scale: 0.98x
  - Box-shadow: 0 4px 10px rgba(30, 187, 215, 0.3)

Disabled:
  - Background: #2A3E54
  - Text: #5A6E84
  - Cursor: not-allowed
  - Opacity: 0.6
```

**Secondary Buttons (Outline):**
```
Default:
  - Background: transparent
  - Border: 1px #1EBBD7
  - Text: #1EBBD7
  - Font-weight: 600

Hover:
  - Background: rgba(30, 187, 215, 0.1)
  - Border: 2px #1EBBD7

Active:
  - Background: rgba(30, 187, 215, 0.2)
  - Border: 2px #1EBBD7
```

**"View in AR" Button (Special):**
```
Default:
  - Background: #1EBBD7
  - Text: #0F1B2E
  - Icon: AR symbol (white or dark)
  - Font-weight: bold
  - Add subtle animation: gentle pulse at 2s interval (scale 1.0 → 1.05 → 1.0)

Hover:
  - Background: #00D9FF
  - Animation: Increase pulse frequency (1.5s interval)
  - Box-shadow: 0 12px 28px rgba(30, 187, 215, 0.5)
```

### Form Elements
**Input Fields:**
```
Default:
  - Border: 1px #2A3E54
  - Background: #1A2E42
  - Text: white
  - Placeholder: #5A6E84

Focus:
  - Border: 2px #1EBBD7
  - Box-shadow: 0 0 0 3px rgba(30, 187, 215, 0.1)
  - Outline: none
```

**Checkboxes/Radio Buttons:**
```
Unchecked:
  - Border: 1px #2A3E54
  - Background: transparent

Checked:
  - Background: #1EBBD7
  - Border: #1EBBD7
  - Checkmark: #0F1B2E
```

### Links
```
Default:
  - Color: #1EBBD7
  - Text-decoration: underline
  - Opacity: 1

Hover:
  - Color: #00D9FF
  - Text-decoration: underline

Visited:
  - Color: #9D4EDD (purple for distinction)
```

---

## PHASE 4: BADGE & LABEL SYSTEM

### Feature Badges
**AR Available Badge:**
```
Text: "AR AVAILABLE"
Background: #1EBBD7
Text color: #0F1B2E
Font-size: 10px
Font-weight: 700
Padding: 4px 8px
Border-radius: 12px
Position: Top-right of product card
Icon: Small AR symbol before text (optional)
```

**Room Generation Badge:**
```
Text: "ROOM GEN"
Background: #9D4EDD
Text color: #FFFFFF
Font-size: 10px
Font-weight: 700
Padding: 4px 8px
Border-radius: 12px
Icon: Small room/layout icon (optional)
```

**Price Match Guarantee:**
```
Text: "PRICE MATCHED"
Background: #39FF14
Text color: #0F1B2E
Font-size: 10px
Font-weight: 700
Padding: 4px 8px
Border-radius: 12px
Icon: Checkmark or price tag icon
Animation: Subtle fade-in when price match is confirmed
```

**Savings Percentage:**
```
Text: "Save 12%"
Background: #39FF14
Text color: #0F1B2E
Font-size: 12px
Font-weight: 700
Padding: 4px 8px
Border-radius: 8px
Format: "Save X%" (bold, visible)
```

---

## PHASE 5: ANIMATION & MICRO-INTERACTIONS

### Button Interactions
```
All buttons:
  - Transition: all 0.2s ease-out
  - On click: Scale down 0.98x for 100ms, then back to normal
  - Hover state timing: 150ms to smooth scale

"View in AR" button:
  - Add subtle pulse animation on page load (3 cycles)
  - Pulse: scale 1.0 → 1.08 → 1.0 over 2s, infinite loop
```

### Product Card Hover
```
Transition timing: all 0.3s ease-out
On hover:
  - Border color fade to teal
  - Box shadow increase smoothly
  - Scale to 1.02x
  - Product image slight zoom (1.03x)
  - Badges fade in/become more prominent
```

### Link Hover
```
Color transition: 150ms ease-out
Underline: Smooth opacity transition
Add bottom border if not present: Animate in
```

### Focus States
```
All interactive elements:
  - Focus ring: 2px #1EBBD7, 3px offset from element
  - Ring animation: None (instant)
  - Maintain accessibility: High contrast focus indicators
```

---

## PHASE 6: ACCESSIBILITY COMPLIANCE

### Color Contrast Verification (WCAG AA Standard)
**Verify these combinations:**
```
✓ White text (#FFFFFF) on #0F1B2E (background) - Ratio: 12.6:1
✓ #0F1B2E text on #1EBBD7 (buttons) - Ratio: 8.2:1
✓ White text on #1EBBD7 (high contrast alt) - Ratio: 5.1:1
✓ White text on #9D4EDD - Ratio: 4.8:1 (borderline, verify)
✓ #0F1B2E text on #39FF14 - Ratio: 17.5:1
```

**Issues to fix:**
- If purple (#9D4EDD) fails contrast test, use white text instead of color variants
- Ensure all badges have minimum 4.5:1 contrast ratio

### Focus Indicators
- Maintain visible focus rings (required for keyboard navigation)
- Use color + styling combination (not color alone)
- Ensure 2px minimum width, 2px offset from element

### Color Alone Rule
- Never use color alone to convey information
- Always pair color with icons, text labels, or patterns
- Example: Instead of just green for "saved", use green + checkmark icon

---

## PHASE 7: RESPONSIVE ADJUSTMENTS

### Mobile Adjustments (< 768px)
```
Product cards:
  - Single column layout
  - Badges: Reduce font-size to 9px
  - Buttons: Full width (100%)
  - Padding increase slightly for touch targets

Navigation:
  - Hamburger menu with accent color
  - Mobile nav background: #1A2E42

Cards:
  - Increase vertical spacing (padding: 16px → 20px)
  - Maintain color scheme exactly
```

### Tablet Adjustments (768px - 1024px)
```
Product grid:
  - 2 columns (adjust from current)
  - Maintain spacing and colors
  - Icons: Slightly larger for touch
```

---

## IMPLEMENTATION CHECKLIST

### CSS/Styling
- [ ] Update CSS color variables for all 5 primary colors
- [ ] Search and replace all hardcoded color values
- [ ] Verify contrast ratios for accessibility
- [ ] Test focus states for keyboard navigation
- [ ] Implement transition timing (0.2s - 0.3s standard)

### Components to Update
- [ ] Navigation bar
- [ ] Hero section
- [ ] Service cards (3-column)
- [ ] Product cards (all instances)
- [ ] Filter pills / buttons
- [ ] Form inputs and states
- [ ] Modals and overlays
- [ ] AR tool interface
- [ ] Room generation sidebar
- [ ] All CTA buttons throughout site

### Testing
- [ ] Test in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify responsive design (mobile, tablet, desktop)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test with screen readers (NVDA, JAWS)
- [ ] Test color blindness simulation (Deuteranopia, Protanopia, Tritanopia)
- [ ] Lighthouse accessibility audit (target: 90+ score)
- [ ] Manual A/B test with users (5-10 participants)

### Documentation
- [ ] Create color style guide document
- [ ] Document animation specifications
- [ ] Create component examples page
- [ ] Document accessibility requirements met
- [ ] Create developer handoff document

---

## DELIVERABLES EXPECTED

1. **Updated Codebase** with all color system changes
2. **Component Library** showing all states (default, hover, active, disabled, focus)
3. **Color Palette Documentation** in design tool (Figma/similar)
4. **Accessibility Report** showing WCAG compliance
5. **Testing Report** with screenshots across devices
6. **Before/After Screenshots** showing key pages
7. **Animation Specifications** document
8. **Mobile Responsiveness Verification**

---

## TIMELINE ESTIMATE

- **Phase 1 (Color System)**: 2-3 days
- **Phase 2 (Components)**: 3-4 days
- **Phase 3 (Interactions)**: 2-3 days
- **Phase 4 (Badges)**: 1-2 days
- **Phase 5 (Animations)**: 2-3 days
- **Phase 6 (Accessibility)**: 2-3 days
- **Phase 7 (Responsive)**: 2-3 days
- **Testing & QA**: 2-3 days

**Total: 16-24 days** (assuming parallel work on components)

---

## FALLBACK OPTIONS (If teal doesn't test well)

### Option 1A: Premium Green Alternative
```
Primary Accent: #2D6A4F (Emerald)
Success: #90EE90 (Light Green)
Background: Keep #0F1B2E
```

### Option 1B: Rose Gold Alternative
```
Primary Accent: #C77A7A (Rose Gold)
Success: #F4A460 (Sandy Brown)
Background: Keep #0F1B2E
```

All alternatives maintain the same structure; only accent colors change.

---

## NOTES

- Maintain all existing layout and spacing (no responsive redesign needed)
- Keep all current copy and messaging
- Focus purely on color system and micro-interactions
- Ensure no functionality is changed, only visual presentation
- Prioritize "View in AR" feature visibility in all changes
- Make "Price Match" feature visually obvious with new badges
- Ensure Room Generation tool is distinct and premium-feeling

