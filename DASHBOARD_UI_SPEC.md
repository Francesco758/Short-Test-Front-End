
 # Dashboard UI Spec (Manager Baseline -> Reuse for Admin)
 
 This document captures the **exact UI/UX rules** currently applied to the **Manager Dashboard** and its **AI Query Chat (TRANSFORMACHINE)** so the same theme and behavior can be reproduced in the **Admin Dashboard** (and other pages) without re-reading Manager code.
 
 ## 1) Goals / Non-Goals
 
 ### Goals
 - Replicate Manager Dashboard **look & feel**:
   - Background colors
   - Border colors/weights
   - Typography (Montserrat, uppercase titles, tracking)
   - Overall dark theme contrast
 - Replicate Manager Dashboard **AI Query Chat behavior** (TRANSFORMACHINE), including:
   - Open/close mechanics
   - Sticky header + bottom input row
   - Streaming response reveal
   - Caret behavior (always-visible blinking caret in idle)
   - No courtesy labels in query row
   - No focus “flash” borders
 - Replicate Manager Dashboard **single-page view behavior** across devices (see Section 4).
 
 ### Non-Goals
 - This doc does not define backend query logic.
 - This doc does not attempt to refactor shared components into a design system (it is a copy/implement guide).
 
 ## 2) Theme Tokens (Manager Dashboard)
 
 ### Page and Panel Colors
 - **Page background**:
   - Typical: `bg-[#09090B]`
   - Desktop-locked/fullscreen wrapper: `bg-black` (fixed inset container)
 - **Alt page background (loading/error screens)**: `bg-[#0a0e14]`
 - **Card/panel background**: `bg-[#18181B]`
 - **Card/panel hover background**: `bg-[#202025]`
 - **Chat header + chat input strip background**: `bg-[#07080A]`
 
 ### Borders / Dividers
 - **Standard panel border**: `border-[1.5px] border-[#2e2e36]`
 - **Chat container border**: `border border-emerald-500/95`
 - **Internal neutral divider** (if used elsewhere): `border-[#27272A]`
 
 ### Text Neutrals (grays used across dashboard)
 - **Muted small caps header text**: `text-gray-500`
 - **Body-muted text / helper text**: `text-gray-400`
 - **Primary text**: `text-white`
 
 ### Accent Colors
 - **Primary accent**: emerald
   - Typical: `text-emerald-500`
   - Border accent: `border-emerald-400/80`
   - Selection accent used on page wrapper: `selection:bg-emerald-500/30`
 
 ### Data / KPI Visuals
 - **Circular progress track**: `#27272A`
 - **Circular progress fill**: `#10B981` (Tailwind `emerald-500`)
 - **Metric bar track**: `bg-white` (container)
 - **Metric bar fill**: `bg-emerald-500`
 
 ### Buttons (canonical variants from CompanyDashboard)
 - **Header neutral button (e.g. Tema:Light / Manage People)**
   - Background: `bg-[#18181B]`
   - Border: `border-[1.5px] border-[#2e2e36]`
   - Hover: `hover:bg-[#202025]`
   - Text style: `font-bold uppercase tracking-widest`
 - **Header outline button (Dashboard back when chat expanded)**
   - Background: `bg-transparent`
   - Border: `border border-emerald-500`
   - Hover: `hover:bg-emerald-500/10`
   - Text: `text-white`
 - **Primary CTA (Launch shorTest)**
   - Background: `bg-emerald-500`
   - Hover: `hover:bg-emerald-400`
   - Text: `text-[#09090B]`
   - Border: `border-[1.5px] border-emerald-400/80`
   - Shadow: `shadow-[0_0_15px_rgba(16,185,129,0.2)]`
 
 ### Status / Feedback Colors
 - **Loading spinner ring**: `border-emerald-500 border-t-transparent`
 - **Error icon**: `text-red-500`
 - **Error icon background**: `bg-red-900/20`
 - **Retry button (error screen)**: `bg-emerald-600 hover:bg-emerald-700 text-white`
 
 ### Typography
 - **Font family**: `Montserrat, sans-serif`
   - Set at wrapper: `style={{ fontFamily: 'Montserrat, sans-serif' }}`
   - And consistently use Tailwind class `font-montserrat`
 - **Titles**:
   - Uppercase
   - Strong tracking (dashboard uses wide letter spacing)
 
 ### Shadows / Elevation
 - **Primary card shadow**: `shadow-xl`
 
 ## 3) AI Query Chat (TRANSFORMACHINE) — Required Behavior
 
 ### Components involved
 - `src/components/common/DataChatbot.jsx`
   - Provides the chat UI and input behavior.
 - `src/components/manager/CompanyDashboard.jsx`
   - Owns the expanded/collapsed state and the open/close animation container.
 
 ### Chat open trigger
 - **Open the expanded chat only when the user sends a message**.
   - Do **not** expand on first click / focus.
   - Implementation detail:
     - In `DataChatbot.jsx`, expansion is triggered from `handleSendMessage`:
       - `if (fullHeightQuery && typeof onRequestExpand === 'function') onRequestExpand();`
 
 ### Sticky header + bottom input
 - In expanded state:
   - Header stays visible (sticky at top of the chat panel).
   - Input row stays at bottom.
 
 ### Header divider
 - The Manager implementation removes the dividing line under the TRANSFORMACHINE title.
   - The full-height header row uses `bg-[#07080A]` without a `border-b`.
 
 ### Corner radius rules
 - The **open** chat panel corners must match the **closed** panel corners.
   - Current Manager baseline: `rounded-lg`.
   - Avoid adding extra rounding in open state.
 
 ### Query row cleanliness
 - No courtesy prefix label in the input row.
   - Do not show `Query user text:`.
 - In full-height mode, keep the field visually clean:
   - Placeholder hidden (`placeholder=""`), so empty field shows only caret.
 
 ### Text sizing (larger across query + chat)
 - Query input in full-height mode uses larger type.
 - Chat message bubbles use larger type + markdown base sizing.
 
 ### Streaming response reveal
 - Bot responses are progressively revealed using `animateBotMessageContent`.
 
 ### Caret behavior (idle + focused)
 - **Always-visible blinking caret when not focused** (idle state).
 - Focused (typing) caret and idle caret must align (same inset).
 
 ### Prevent focus-border “blink” (important)
 - When entering typing mode (and when programmatically re-focusing after bot response completes), the input must not briefly render a native focus border.
 - Manager baseline includes a chrome suppression path:
   - Inline styles on the full-height input:
     - `outline: none`
     - `boxShadow: none`
     - `border: 0`
     - `appearance: none`
     - `WebkitAppearance: none`
   - Programmatic focus uses a helper that focuses and immediately suppresses chrome.
 
 ## 4) Single-Page View Behavior (All Devices)
 
 This is the Manager Dashboard behavior where the whole dashboard is presented as a **single-page view**, with the layout adapting across devices while staying within one coherent page.
 
 ### Desktop-locked (full-screen) behavior
 - The dashboard can run in a “desktop-locked” layout:
   - Outer wrapper uses `fixed inset-0 h-[100dvh] overflow-hidden`.
   - Content is arranged into **three equal-height rows**.
 - When chat expands:
   - The top two rows collapse/animate away.
   - The third row (TRANSFORMACHINE) becomes the primary visible region.
 
 ### Non-desktop (mobile/tablet) behavior
 - The dashboard remains a single page with vertical flow.
 - Chat expansion still happens within the same page context.
 
 ### Implementation notes
 - The Manager single-page effect is achieved in `CompanyDashboard.jsx` by:
   - Using a fixed/fullscreen wrapper for desktop-locked mode.
   - Structuring main content into 3 rows.
   - Animating the first two rows out using transitions on:
     - `opacity`
     - `transform`
     - `max-height`
   - Expanding the TRANSFORMACHINE row to a large usable chat panel.
 
 ### Key rule to replicate in Admin
 - The Admin dashboard should:
   - Keep a consistent one-page layout container.
   - Use responsive row/section sizing rules.
   - Use the same open/close state control for AI chat.
 
 ## 5) Where to Copy From (Authoritative Source)
 
 ### Manager Dashboard
 - `src/components/manager/CompanyDashboard.jsx`
   - Owns:
     - `isAIConversationExpanded`
     - `isChatOpening`
     - `chatRiseIn` keyframes
     - TRANSFORMACHINE container sizing and expansion
 
 ### AI Chat UI
 - `src/components/common/DataChatbot.jsx`
   - Owns:
     - fullHeightQuery mode styling
     - blinking caret overlay
     - input chrome suppression
     - streaming reveal
 
 ## 6) Admin Dashboard Integration Checklist
 
 When applying Manager behavior to Admin:
 - Use Montserrat font and the same background + border palette.
 - Mount `DataChatbot` with the same full-height props:
   - `fullHeightQuery={true}`
   - `fullHeightExpanded={isAIConversationExpanded}`
   - `fullHeightQueryLabel={'TRANSFORMACHINE'}` (or Admin-specific label if needed)
   - `suggestedQuestions={[]}` (Manager baseline)
 - Ensure expansion is controlled by the parent dashboard component:
   - Provide `onRequestExpand={handleRequestExpandChat}`
   - Ensure the parent only expands on send (DataChatbot already triggers on send in full-height mode).
 - Implement the same “single-page view” layout rules:
   - Desktop-locked: fixed full-screen container with 3-row structure.
   - Non-desktop: single-page vertical layout.
 
 ## 7) Notes / Safe Defaults
 - Prefer reproducing behavior by copying the parent expansion pattern (from Manager) rather than inventing new expansion logic.
 - Keep open/close animation logic in the parent dashboard component, not in `DataChatbot`.

