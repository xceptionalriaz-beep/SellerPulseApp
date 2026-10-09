// lib/template-utils.ts

export function wrapTemplateHtml(html: string): string {
    const sanitizedHtml = html;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#333;background:#fff;padding:8px;}
    h1{font-size:18px;font-weight:700;color:#1e1535;margin:0 0 4px;}
    h2{font-size:14px;font-weight:700;color:#1e1535;margin:8px 0 2px;}
    p{font-size:11px;color:#666;margin:0 0 4px;}
    table{width:100%;border-collapse:collapse;margin-bottom:8px;}
    td,th{padding:4px 6px;border:1px solid #eee;font-size:11px;text-align:left;}
    th{background:#f9f9f9;color:#333;font-weight:700;}
    img{max-width:100%;height:auto;display:block;border-radius:4px;}
    </style></head><body>${sanitizedHtml}</body></html>`;
}

export function hydrateTemplateContent(html: string): string {
    if (!html) return '';

    let processedHtml = html;

    // Guard against raw JSON state stored in description_html
    const trimmed = processedHtml.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return `
            <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
                <h3 style="font-size: 16px; color: #7530fb; margin-bottom: 8px;">Visual Template</h3>
                <p style="font-size: 13px; color: #6b7280;">Ready for Preview</p>
            </div>
        `;
    }

    const placeholderMap: Record<string, string> = {
        '{{PRODUCT_TITLE}}': 'Premium Ergonomic Pet Grooming Brush – Stainless Steel',
        '{{PRODUCT_DESCRIPTION}}': 'Professional-grade tool built for daily use. Premium materials, precision engineered, and rigorously tested to deliver reliable performance.',
        '{{ITEM_DESCRIPTION}}': 'Professional-grade tool built for daily use. Premium materials, precision engineered, and rigorously tested to deliver reliable performance.',
        '{{ITEM_PRICE}}': '$29.99',
        '{{PRICE}}': '$29.99',
        '{{ORIGINAL_PRICE}}': '$39.99',
        '{{SKU}}': 'PET-BRUSH-001',
        '{{QUANTITY}}': '12',
        '{{WATCHERS}}': '28',
        '{{BRAND}}': 'FurShield',
        '{{MPN}}': 'FS-DBT-7821',
        '{{TYPE}}': 'Grooming Brush',
        '{{MATERIAL}}': 'Stainless Steel',
        '{{FEATURES}}': 'Self-Cleaning, Ergonomic Grip',
        '{{SUITABLE_FOR}}': 'Cats & Dogs',
        '{{EAN}}': '5012345678900',
        '{{WARRANTY}}': '1 Year Manufacturer',
        '{{ITEM_CONDITION}}': 'Brand New',
        '{{SHIPPING_TIME}}': '1-2 Business Days',
        '{{RETURN_POLICY}}': '30-day free return. No questions asked.',
        '{{SELLER_NAME}}': 'Trusted Pet Supplies',
        '{{FEEDBACK_SCORE}}': '12,450',
        '{{FEEDBACK_PERCENT}}': '99.4',

        // Images
        '{{MAIN_IMAGE_URL}}': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=600&fit=crop',
        '{{PRODUCT_IMAGE}}': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=600&fit=crop',
        '{{IMAGE_2_URL}}': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
        '{{IMAGE_3_URL}}': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&h=400&fit=crop',
        '{{IMAGE_4_URL}}': 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400&h=400&fit=crop',
        '{{IMAGE_5_URL}}': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
        '{{LIFESTYLE_IMAGE_URL}}': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700&h=500&fit=crop',
        '{{GALLERY_IMAGE_1}}': 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400&h=300&fit=crop',
        '{{GALLERY_IMAGE_2}}': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
        '{{GALLERY_IMAGE_3}}': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&h=300&fit=crop',

        // Related / Cross-sell
        '{{RELATED_IMAGE_1}}': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
        '{{RELATED_TITLE_1}}': 'Organic Pet Shampoo',
        '{{RELATED_PRICE_1}}': '$14.99',
        '{{RELATED_IMAGE_2}}': 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=300&h=300&fit=crop',
        '{{RELATED_TITLE_2}}': 'Durable Chew Toy',
        '{{RELATED_PRICE_2}}': '$9.99',
        '{{RELATED_IMAGE_3}}': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&h=300&fit=crop',
        '{{RELATED_TITLE_3}}': 'Interactive Feather Wand',
        '{{RELATED_PRICE_3}}': '$7.99',
        '{{RELATED_IMAGE_4}}': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
        '{{RELATED_TITLE_4}}': 'Stainless Steel Pet Bowl',
        '{{RELATED_PRICE_4}}': '$12.99',
    };

    Object.entries(placeholderMap).forEach(([placeholder, sample]) => {
        processedHtml = processedHtml.split(placeholder).join(sample);
    });

    // Remove any remaining unreplaced tokens cleanly
    processedHtml = processedHtml.replace(/\{\{\s*[\w\s]+\s*\}\}/gi, '');

    return processedHtml;
}
