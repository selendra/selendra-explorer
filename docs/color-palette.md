# Selendra Explorer Color Palette Guide

This color palette is derived from the Selendra explorer logo, featuring a gradient from blue to purple. The palette is designed to reflect trust, innovation, and technological advancement while maintaining a clean, modern look suitable for a blockchain explorer.

## Primary Colors

| Color Name        | Hex Code   | RGB                | Description                           |
|-------------------|------------|--------------------|------------------------------------- |
| Selendra Blue     | `#0CCBD6`  | rgb(12, 203, 214)  | Primary blue from logo               |
| Selendra Purple   | `#8C30F5`  | rgb(140, 48, 245)  | Primary purple from logo             |
| Selendra Navy     | `#1A237E`  | rgb(26, 35, 126)   | Deeper blue for contrast and depth   |

## Secondary Colors

| Color Name        | Hex Code   | RGB                | Description                           |
|-------------------|------------|--------------------|------------------------------------- |
| Light Blue        | `#4FD1DB`  | rgb(79, 209, 219)  | Lighter variation of Selendra Blue   |
| Light Purple      | `#A76DF7`  | rgb(167, 109, 247) | Lighter variation of Selendra Purple |
| Deep Purple       | `#6A26B6`  | rgb(106, 38, 182)  | Darker variation of Selendra Purple  |
| Deep Teal         | `#08979D`  | rgb(8, 151, 157)   | Darker variation of Selendra Blue    |

## Neutral Colors

| Color Name        | Hex Code   | RGB                | Description                           |
|-------------------|------------|--------------------|------------------------------------- |
| Dark Gray         | `#1F2937`  | rgb(31, 41, 55)    | Dark backgrounds, text in light mode |
| Medium Gray       | `#4B5563`  | rgb(75, 85, 99)    | Secondary text, borders              |
| Light Gray        | `#E5E7EB`  | rgb(229, 231, 235) | Borders, dividers in light mode      |
| Off White         | `#F9FAFB`  | rgb(249, 250, 251) | Background in light mode             |

## Accent Colors

| Color Name        | Hex Code   | RGB                | Description                           |
|-------------------|------------|--------------------|------------------------------------- |
| Success Green     | `#10B981`  | rgb(16, 185, 129)  | Success states, positive information  |
| Warning Amber     | `#F59E0B`  | rgb(245, 158, 11)  | Warnings, important information       |
| Danger Red        | `#EF4444`  | rgb(239, 68, 68)   | Errors, critical actions              |
| Info Blue         | `#3B82F6`  | rgb(59, 130, 246)  | Information, help text                |

## Gradients

| Gradient Name     | Definition                                      | Usage                                |
|-------------------|------------------------------------------------|--------------------------------------|
| Primary Gradient  | Linear from `#8C30F5` to `#0CCBD6`             | Main CTA buttons, key UI elements    |
| Hero Gradient     | Linear from `#8C30F5` (15%) to `#0CCBD6` (85%) | Hero sections, featured backgrounds  |
| Card Gradient     | Linear from `#8C30F5/10` via white to `#0CCBD6/10` | Card backgrounds, subtle highlights  |
| Dark Gradient     | Linear from `#1A237E` to `#08979D`             | Dark mode accents, button hovers     |

## Usage Guidelines

### Text Colors

- Primary text: `#1F2937` (dark mode: `#F9FAFB`)
- Secondary text: `#4B5563` (dark mode: `#9CA3AF`)
- Accent text: `#8C30F5` or `#0CCBD6` depending on context

### Background Colors

- Main background: `#F9FAFB` (dark mode: `#111827`)
- Card/section background: `#FFFFFF` (dark mode: `#1F2937`)
- Featured sections: Primary Gradient or Card Gradient

### UI Elements

- Primary buttons: Primary Gradient
- Secondary buttons: `#E5E7EB` with dark text (dark mode: `#374151` with light text)
- Borders: `#E5E7EB` (dark mode: `#374151`)
- Dividers: `#F3F4F6` (dark mode: `#1F2937`)
- Hover states: 10% darker than the base color

### Data Visualization

- EVM contracts/transactions: Variations of Selendra Purple
- Wasm contracts/transactions: Variations of Selendra Blue
- Token information: Success Green or Info Blue
- Validator data: Deep Purple or Deep Teal

## Accessibility Considerations

Ensure text has sufficient contrast against backgrounds according to WCAG AA standards:
- Use dark text on light backgrounds and light text on dark backgrounds
- Avoid placing text directly on vivid gradients without proper contrast
- Include focus states with sufficient contrast for keyboard navigation 