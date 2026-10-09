// ── specWords.ts ──────────────────────────────────────────────────────────────
// Step 2 of the Title Engine Learning Path: Spec Words (Never Touch)
//
// Purpose:
//   Teaches the engine which words are SPECS — measurable, factual data
//   that buyers search for exactly. These must NEVER be changed, removed,
//   swapped with synonyms, or moved from their position.
//
// Rule: If a word describes a measurable fact about the product, it's a spec.
//       If it's subjective (amazing, premium, durable), it's NOT a spec.
//
// Examples:
//   "45W"          → spec (power output — buyers search exactly "45W")
//   "64GB"         → spec (storage — buyers search exactly "64GB")
//   "Bluetooth 5.3"→ spec (version — buyers search exactly "5.3")
//   "Size 10 UK"   → spec (shoe size — buyers search exactly "Size 10")
//   "Durable"      → NOT a spec (subjective descriptor)
//   "Premium"      → NOT a spec (marketing filler)
// ─────────────────────────────────────────────────────────────────────────────

// ── Pattern-based spec detection ─────────────────────────────────────────────
// These regex patterns catch any word that matches a spec format.
// Engine checks these FIRST before word-by-word lookup.
export const SPEC_PATTERNS: { pattern: RegExp; type: string; description: string }[] = [

    // ── Power & Electrical ────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*w$/i, type: 'power', description: 'Wattage (45W, 100W, 1700W)' },
    { pattern: /^\d+(\.\d+)?\s*kw$/i, type: 'power', description: 'Kilowatts (1.5KW, 2KW)' },
    { pattern: /^\d+(\.\d+)?\s*v$/i, type: 'voltage', description: 'Voltage (12V, 240V, 110V)' },
    { pattern: /^\d+(\.\d+)?\s*mah$/i, type: 'battery', description: 'Battery capacity (5000mAh, 10000mAh)' },
    { pattern: /^\d+(\.\d+)?\s*ah$/i, type: 'battery', description: 'Amp hours (2Ah, 5Ah)' },
    { pattern: /^\d+(\.\d+)?\s*a$/i, type: 'current', description: 'Amperage (3A, 20A)' },
    { pattern: /^\d+(\.\d+)?\s*hz$/i, type: 'frequency', description: 'Frequency (50Hz, 60Hz, 144Hz)' },

    // ── Storage & Memory ──────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*gb$/i, type: 'storage', description: 'Gigabytes (64GB, 256GB, 1GB)' },
    { pattern: /^\d+(\.\d+)?\s*tb$/i, type: 'storage', description: 'Terabytes (1TB, 2TB, 4TB)' },
    { pattern: /^\d+(\.\d+)?\s*mb$/i, type: 'storage', description: 'Megabytes (512MB, 128MB)' },
    { pattern: /^\d+(\.\d+)?\s*kb$/i, type: 'storage', description: 'Kilobytes (rare but valid)' },

    // ── Dimensions & Size ─────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*mm$/i, type: 'dimension', description: 'Millimetres (10mm, 50mm)' },
    { pattern: /^\d+(\.\d+)?\s*cm$/i, type: 'dimension', description: 'Centimetres (30cm, 100cm)' },
    { pattern: /^\d+(\.\d+)?\s*m$/i, type: 'dimension', description: 'Metres (1m, 5m, 10m)' },
    { pattern: /^\d+(\.\d+)?\s*inch(es)?$/i, type: 'dimension', description: 'Inches (10 inch, 55 inches)' },
    { pattern: /^\d+(\.\d+)?"/, type: 'dimension', description: 'Inch symbol (10", 55")' },
    { pattern: /^\d+(\.\d+)?\s*ft$/i, type: 'dimension', description: 'Feet (6ft, 10ft)' },
    { pattern: /^\d+(\.\d+)?\s*yard(s)?$/i, type: 'dimension', description: 'Yards (1 yard, 5 yards)' },
    { pattern: /^\d+x\d+(\s*cm|\s*mm|\s*m|\s*inch)?$/i, type: 'dimensions', description: 'Width x Height (30x40, 66x72cm)' },
    { pattern: /^\d+(\.\d+)?\s*litr?e?s?$/i, type: 'capacity', description: 'Litres (1L, 5.5L, 1 litre)' },
    { pattern: /^\d+(\.\d+)?\s*l$/i, type: 'capacity', description: 'Litres abbreviated (1L, 5.5L)' },
    { pattern: /^\d+(\.\d+)?\s*ml$/i, type: 'capacity', description: 'Millilitres (500ml, 250ml)' },
    { pattern: /^\d+(\.\d+)?\s*fl\s*oz$/i, type: 'capacity', description: 'Fluid ounces (16fl oz)' },

    // ── Weight ────────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*kg$/i, type: 'weight', description: 'Kilograms (1kg, 5kg)' },
    { pattern: /^\d+(\.\d+)?\s*g$/i, type: 'weight', description: 'Grams (100g, 500g)' },
    { pattern: /^\d+(\.\d+)?\s*lb(s)?$/i, type: 'weight', description: 'Pounds (5lb, 10lbs)' },
    { pattern: /^\d+(\.\d+)?\s*oz$/i, type: 'weight', description: 'Ounces (8oz, 16oz)' },
    { pattern: /^\d+(\.\d+)?\s*stone$/i, type: 'weight', description: 'Stone (10 stone)' },

    // ── Speed & Data Rate ─────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*mbps$/i, type: 'speed', description: 'Megabits per second (100Mbps)' },
    { pattern: /^\d+(\.\d+)?\s*gbps$/i, type: 'speed', description: 'Gigabits per second (1Gbps)' },
    { pattern: /^\d+(\.\d+)?\s*rpm$/i, type: 'speed', description: 'RPM (7200RPM, 3000RPM)' },
    { pattern: /^\d+(\.\d+)?\s*mph$/i, type: 'speed', description: 'Miles per hour (60mph)' },
    { pattern: /^\d+(\.\d+)?\s*km\/h$/i, type: 'speed', description: 'Kilometres per hour (100km/h)' },

    // ── Display & Resolution ──────────────────────────────────────────────────
    { pattern: /^\d+k$/i, type: 'resolution', description: '4K, 8K resolution' },
    { pattern: /^\d+p$/i, type: 'resolution', description: '1080p, 720p, 4K resolution' },
    { pattern: /^\d+\s*mp$/i, type: 'resolution', description: 'Megapixels (12MP, 48MP)' },
    { pattern: /^\d+\s*megapixel(s)?$/i, type: 'resolution', description: 'Megapixels written out' },

    // ── Temperature ───────────────────────────────────────────────────────────
    { pattern: /^-?\d+(\.\d+)?\s*°?c$/i, type: 'temperature', description: 'Celsius (-20°C, 180°C)' },
    { pattern: /^-?\d+(\.\d+)?\s*°?f$/i, type: 'temperature', description: 'Fahrenheit (32°F, 350°F)' },

    // ── Sound ─────────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*db$/i, type: 'sound', description: 'Decibels (85dB, 100dB)' },
    { pattern: /^\d+(\.\d+)?\s*w\s*rms$/i, type: 'power', description: 'RMS power (50W RMS)' },

    // ── Clothing & Shoe Sizes ─────────────────────────────────────────────────
    { pattern: /^(uk|us|eu)\s*\d+(\.\d+)?$/i, type: 'size', description: 'Regional size (UK 8, US 10, EU 42)' },
    { pattern: /^size\s*(xs|s|m|l|xl|xxl|xxxl|2xl|3xl|4xl|5xl|6xl|8|10|12|14|16|18|20)$/i, type: 'size', description: 'Size label' },
    { pattern: /^(xs|s|m|l|xl|xxl|xxxl|2xl|3xl|4xl|5xl)$/i, type: 'size', description: 'Size abbreviation' },
    { pattern: /^\d+[-–]\d+\s*(month|months|year|years|m|y)s?$/i, type: 'size', description: 'Age size (0-3 months, 2-3 years)' },

    // ── Version Numbers ───────────────────────────────────────────────────────
    { pattern: /^v?\d+\.\d+(\.\d+)?$/i, type: 'version', description: 'Version number (v2.0, 1.4.1)' },
    { pattern: /^\d+(st|nd|rd|th)\s+gen(eration)?$/i, type: 'version', description: 'Generation (2nd gen, 3rd Generation)' },

    // ── Model Numbers ─────────────────────────────────────────────────────────
    { pattern: /^[A-Z]{1,4}\d{3,}[A-Z0-9]*$/, type: 'model', description: 'Model number (A1234, XB500)' },
    { pattern: /^\d{3,}[A-Z]{1,4}$/, type: 'model', description: 'Reverse model number (500XB)' },

    // ── Connectivity ──────────────────────────────────────────────────────────
    { pattern: /^usb\s*[23](\.\d+)?$/i, type: 'connectivity', description: 'USB version (USB 3.0, USB 2)' },
    { pattern: /^hdmi\s*\d+(\.\d+)?$/i, type: 'connectivity', description: 'HDMI version (HDMI 2.1)' },
    { pattern: /^bluetooth\s*\d+(\.\d+)?$/i, type: 'connectivity', description: 'Bluetooth version (Bluetooth 5.3)' },
    { pattern: /^wifi\s*\d+$/i, type: 'connectivity', description: 'WiFi generation (WiFi 6)' },
    { pattern: /^802\.\d+[a-z]+$/i, type: 'connectivity', description: 'WiFi standard (802.11ac)' },


    // ── Pressure ──────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*psi$/i, type: 'pressure', description: 'PSI (100PSI, 150PSI)' },
    { pattern: /^\d+(\.\d+)?\s*bar$/i, type: 'pressure', description: 'Bar (2bar, 10bar)' },
    { pattern: /^\d+(\.\d+)?\s*pa$/i, type: 'pressure', description: 'Pascal' },

    // ── Flow rate ─────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*lpm$/i, type: 'flow', description: 'Litres per minute' },
    { pattern: /^\d+(\.\d+)?\s*gph$/i, type: 'flow', description: 'Gallons per hour' },

    // ── Torque ────────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*nm$/i, type: 'torque', description: 'Newton metres (50Nm)' },
    { pattern: /^\d+(\.\d+)?\s*ft[-\s]?lb$/i, type: 'torque', description: 'Foot pounds (30ft-lb)' },

    // ── Drill / Tool specific ─────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*mm\s*chuck$/i, type: 'spec', description: 'Chuck size (10mm chuck, 13mm chuck)' },
    { pattern: /^\d+v\s*max$/i, type: 'voltage', description: 'Max voltage (18V Max, 20V Max)' },
    { pattern: /^\d+(\.\d+)?\s*v\s*li$/i, type: 'voltage', description: 'Li-ion voltage (18V Li)' },

    // ── Noise level ───────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*dba$/i, type: 'sound', description: 'A-weighted decibels (65dBA)' },
    { pattern: /^<\s*\d+\s*db$/i, type: 'sound', description: 'Less than X decibels' },

    // ── Angle ─────────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*°$/, type: 'angle', description: 'Degrees (90°, 360°)' },
    { pattern: /^\d+(\.\d+)?\s*degree(s)?$/i, type: 'angle', description: 'Degrees written out' },

    // ── Thread size ───────────────────────────────────────────────────────────
    { pattern: /^m\d+(\.\d+)?$/i, type: 'thread', description: 'Metric thread (M6, M8, M10, M12)' },
    { pattern: /^\d+\/\d+"\s*$/, type: 'thread', description: 'Imperial thread (1/4", 3/8")' },
    { pattern: /^bsp$/i, type: 'thread', description: 'British Standard Pipe thread' },
    { pattern: /^npt$/i, type: 'thread', description: 'National Pipe Thread' },

    // ── Rope / Cable ──────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*mm\s*dia(meter)?$/i, type: 'spec', description: 'Diameter (5mm dia)' },
    { pattern: /^\d+(\.\d+)?\s*strand(s)?$/i, type: 'spec', description: 'Strands (7 strand, 19 strand)' },
    { pattern: /^\d+(\.\d+)?\s*core(s)?$/i, type: 'spec', description: 'Cable cores (2 core, 3 core)' },

    // ── Paint / Colour codes ──────────────────────────────────────────────────
    { pattern: /^#[0-9a-f]{3,6}$/i, type: 'colour-code', description: 'Hex colour code' },
    { pattern: /^ral\s*\d{4}$/i, type: 'colour-code', description: 'RAL colour code (RAL 9010)' },
    { pattern: /^bs\s*\d+$/i, type: 'colour-code', description: 'BS colour code' },
    { pattern: /^pantone\s*.+$/i, type: 'colour-code', description: 'Pantone colour code' },

    // ── Fabric weight ─────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*gsm$/i, type: 'fabric', description: 'Grams per square metre (200gsm, 300gsm)' },
    { pattern: /^\d+(\.\d+)?\s*denier$/i, type: 'fabric', description: 'Denier (15 denier, 40 denier)' },
    { pattern: /^\d+(\.\d+)?\s*tog$/i, type: 'warmth', description: 'Tog rating for duvets (10.5 tog, 13.5 tog)' },

    // ── SPF ───────────────────────────────────────────────────────────────────
    { pattern: /^spf\s*\d+\+?$/i, type: 'protection', description: 'Sun protection factor (SPF 30, SPF 50+)' },

    // ── Load / Weight capacity ────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*kg\s*(max|capacity|load|limit)?$/i, type: 'capacity', description: 'Weight capacity (150kg max)' },
    { pattern: /^max\.?\s*\d+(\.\d+)?\s*kg$/i, type: 'capacity', description: 'Max load (Max 150kg)' },
    { pattern: /^up\s*to\s*\d+(\.\d+)?\s*kg$/i, type: 'capacity', description: 'Up to X kg' },

    // ── Lumens / Lighting ─────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*lm$/i, type: 'brightness', description: 'Lumens (800lm, 1500lm)' },
    { pattern: /^\d+(\.\d+)?\s*lumen(s)?$/i, type: 'brightness', description: 'Lumens written out' },
    { pattern: /^\d+(\.\d+)?\s*lux$/i, type: 'brightness', description: 'Lux (1000 lux)' },
    { pattern: /^\d+(\.\d+)?\s*k\s*colour$/i, type: 'colour-temp', description: 'Colour temperature (3000K, 6500K)' },
    { pattern: /^\d+(\.\d+)?\s*k$/i, type: 'colour-temp', description: 'Kelvin colour temp (2700K, 4000K)' },
    { pattern: /^cri\s*\d+\+?$/i, type: 'lighting', description: 'Colour Rendering Index (CRI 90+)' },
    { pattern: /^ip\d{2}$/i, type: 'protection', description: 'IP protection rating (IP65, IP67)' },
    { pattern: /^ipx\d$/i, type: 'protection', description: 'IPX water rating (IPX7, IPX8)' },

    // ── Scan rate / Refresh ───────────────────────────────────────────────────
    { pattern: /^\d+\s*fps$/i, type: 'speed', description: 'Frames per second (30fps, 60fps, 120fps)' },
    { pattern: /^\d+\s*hz\s*refresh$/i, type: 'speed', description: 'Refresh rate (144Hz refresh)' },

    // ── Range ─────────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*(km|mile(s)?)\s*(range)?$/i, type: 'range', description: 'Range (10km range, 5 miles)' },
    { pattern: /^up\s*to\s*\d+(\.\d+)?\s*(m|km|ft|miles?)$/i, type: 'range', description: 'Up to X range' },

    // ── pH ────────────────────────────────────────────────────────────────────
    { pattern: /^ph\s*\d+(\.\d+)?$/i, type: 'chemistry', description: 'pH level (pH 7, pH 6.5)' },

    // ── Fuel / Engine ─────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*cc$/i, type: 'engine', description: 'Engine displacement (125cc, 1000cc)' },
    { pattern: /^\d+(\.\d+)?\s*(bhp|hp|ps)$/i, type: 'power', description: 'Horsepower (150bhp, 200hp)' },
    { pattern: /^e\d+$/i, type: 'fuel', description: 'Petrol grade (E5, E10)' },

    // ── Concentration / Strength ──────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*%$/, type: 'concentration', description: 'Percentage (5%, 99%, 100%)' },
    { pattern: /^\d+(\.\d+)?\s*(mg|mcg|iu|ug)$/i, type: 'dosage', description: 'Supplement dosage (500mg, 1000iu)' },
    { pattern: /^\d+(\.\d+)?\s*ml\s*per\s*(day|dose|serving)$/i, type: 'dosage', description: 'Dosage per serving' },

    // ── Print resolution ──────────────────────────────────────────────────────
    { pattern: /^\d+\s*dpi$/i, type: 'resolution', description: 'Dots per inch (300dpi, 600dpi)' },
    { pattern: /^\d+\s*ppi$/i, type: 'resolution', description: 'Pixels per inch (401ppi)' },

    // ── Signal strength ───────────────────────────────────────────────────────
    { pattern: /^-?\d+(\.\d+)?\s*dbm$/i, type: 'signal', description: 'Signal strength (-70dBm)' },
    { pattern: /^\d+(\.\d+)?\s*dbi$/i, type: 'antenna', description: 'Antenna gain (5dBi)' },

    // ── Date / Year ───────────────────────────────────────────────────────────
    { pattern: /^(19|20)\d{2}$/, type: 'year', description: 'Year (2024, 1985, 2019)' },
    { pattern: /^\d+(st|nd|rd|th)$/i, type: 'ordinal', description: 'Ordinal number (1st, 2nd, 3rd)' },

    // ── ISBN / Barcode ────────────────────────────────────────────────────────
    { pattern: /^isbn[-\s]?\d{9,13}$/i, type: 'identifier', description: 'ISBN number' },
    { pattern: /^\d{12,14}$/, type: 'identifier', description: 'Barcode/UPC/EAN' },

    // ── Clothing specific ─────────────────────────────────────────────────────
    { pattern: /^\d+[-–]\d+\s*(inch|in|")$/i, type: 'measurement', description: 'Inch range (28-30 inch, 32-34")' },
    { pattern: /^inside\s*leg\s*\d+$/i, type: 'size', description: 'Inside leg measurement' },
    { pattern: /^leg\s*\d+\s*(l|r|s)?$/i, type: 'size', description: 'Leg size' },
    { pattern: /^waist\s*\d+$/i, type: 'size', description: 'Waist size' },
    { pattern: /^chest\s*\d+$/i, type: 'size', description: 'Chest size' },
    { pattern: /^collar\s*\d+(\.\d+)?$/i, type: 'size', description: 'Collar size' },
    { pattern: /^cup\s*[a-g]{1,2}$/i, type: 'size', description: 'Bra cup size (Cup A, Cup DD)' },
    { pattern: /^\d+[a-g]{1,2}$/i, type: 'size', description: 'Bra size (32A, 36DD)' },


    // ── Version / Edition words ───────────────────────────────────────────────
    { pattern: /^(gen|generation)\s*\d+$/i, type: 'version', description: 'Gen 1, Gen 2, Generation 3' },
    { pattern: /^series\s*\d+$/i, type: 'version', description: 'Series 3, Series 8, Series 9' },
    { pattern: /^\d+(st|nd|rd|th)\s*edition$/i, type: 'edition', description: '1st edition, 2nd edition' },
    { pattern: /^v\d+$/i, type: 'version', description: 'V1, V2, V3' },
    { pattern: /^mk\s*\d+$/i, type: 'version', description: 'MK1, MK2, MK3 (Mark versions)' },

    // ── Tyre specs ────────────────────────────────────────────────────────────
    { pattern: /^\d{3}\/\d{2}\s*[rR]?\d{2}$/, type: 'tyre', description: 'Tyre size (195/65R15, 205/55 R16)' },
    { pattern: /^\d{3}\/\d{2}\s*[rR]\s*\d{2}$/, type: 'tyre', description: 'Tyre size with space' },

    // ── Electrical amperage ───────────────────────────────────────────────────
    { pattern: /^\d+\s*amp$/i, type: 'electrical', description: 'Amperage (13 amp, 16 amp, 32 amp)' },
    { pattern: /^\d+\s*(gang|way)$/i, type: 'electrical', description: 'Gang/way switch (1 gang, 2 way)' },

    // ── Photography filters ───────────────────────────────────────────────────
    { pattern: /^nd\d+$/i, type: 'photo-filter', description: 'ND filter strength (ND4, ND8, ND16)' },
    { pattern: /^\d+mm\s*filter$/i, type: 'photo-filter', description: 'Filter diameter (67mm filter)' },
    { pattern: /^iso\s*\d+$/i, type: 'photo-spec', description: 'ISO sensitivity (ISO 100, ISO 3200)' },
    { pattern: /^\d+\/\d+\s*s(ec)?$/i, type: 'photo-spec', description: 'Shutter speed (1/4000s, 1/8000s)' },

    // ── Fishing specs ─────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*lb\s*(test|mono|braid|line)?$/i, type: 'fishing', description: 'Line strength (10lb, 20lb test)' },
    { pattern: /^#?\d+\s*hook$/i, type: 'fishing', description: 'Hook size (#4 hook, size 8 hook)' },
    { pattern: /^\d+\/0$/, type: 'fishing', description: 'Hook size (2/0, 3/0, 4/0)' },

    // ── Optical / Prescription ────────────────────────────────────────────────
    { pattern: /^[+\-]\d+(\.\d+)?\s*dioptre?s?$/i, type: 'optical', description: 'Lens strength (+1.5, +2.0, -1.0)' },
    { pattern: /^[+\-]\d+(\.\d+)?$/, type: 'optical', description: 'Prescription power (+1.5, -2.0)' },

    // ── PCIe / Storage interface ──────────────────────────────────────────────
    { pattern: /^pcie\s*\d+(\.\d+)?\s*(x\d+)?$/i, type: 'interface', description: 'PCIe gen (PCIe 4.0, PCIe 5.0 x4)' },
    { pattern: /^sata\s*(i{1,3}|\d)$/i, type: 'interface', description: 'SATA version (SATA III, SATA 3)' },
    { pattern: /^\d+(\.\d+)?\s*inch\s*(hdd|ssd|drive)?$/i, type: 'storage', description: 'Drive form factor (2.5 inch, 3.5 inch)' },
    { pattern: /^ddr\d([-\s]\d{4})?$/i, type: 'memory', description: 'RAM type (DDR4, DDR5, DDR4-3200)' },
    { pattern: /^lpddr\d$/i, type: 'memory', description: 'Mobile RAM (LPDDR4, LPDDR5)' },

    // ── Colour temperature descriptors ────────────────────────────────────────
    { pattern: /^warm\s*white$/i, type: 'colour-temp', description: 'Warm white (~2700K)' },
    { pattern: /^cool\s*white$/i, type: 'colour-temp', description: 'Cool white (~4000K)' },
    { pattern: /^natural\s*white$/i, type: 'colour-temp', description: 'Natural white (~3500K)' },
    { pattern: /^daylight\s*(white)?$/i, type: 'colour-temp', description: 'Daylight (~6500K)' },

    // ── Clothing fit types ────────────────────────────────────────────────────
    { pattern: /^(slim|regular|relaxed|skinny|straight|tapered|athletic|loose|fitted|oversized)\s*fit$/i, type: 'fit', description: 'Clothing fit type' },

    // ── Shoe width ────────────────────────────────────────────────────────────
    { pattern: /^(2e|4e|6e|ee|eee|eeee)$/i, type: 'width', description: 'Shoe width (2E wide, 4E extra wide)' },
    { pattern: /^[dbe]\s*width$/i, type: 'width', description: 'Width designation (D width, B width)' },


    // ── Frequency ─────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*mhz$/i, type: 'frequency', description: 'Megahertz (433MHz, 868MHz, 2400MHz)' },
    { pattern: /^\d+(\.\d+)?\s*ghz$/i, type: 'frequency', description: 'Gigahertz (2.4GHz, 5GHz, 6GHz)' },
    { pattern: /^\d+(\.\d+)?\s*khz$/i, type: 'frequency', description: 'Kilohertz (40KHz, 455KHz)' },

    // ── Force / Breaking strength ─────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*kn$/i, type: 'force', description: 'Kilonewtons (10kN, 25kN breaking strength)' },
    { pattern: /^\d+(\.\d+)?\s*n$/i, type: 'force', description: 'Newtons (500N, 1000N)' },

    // ── Energy ────────────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*kwh$/i, type: 'energy', description: 'Kilowatt hours (100kWh, 200kWh)' },
    { pattern: /^\d+(\.\d+)?\s*wh$/i, type: 'energy', description: 'Watt hours (20Wh, 50Wh)' },
    { pattern: /^\d+(\.\d+)?\s*wp$/i, type: 'energy', description: 'Peak watts solar (100Wp, 200Wp)' },

    // ── Magnification ─────────────────────────────────────────────────────────
    { pattern: /^\d+x\s*magnification$/i, type: 'magnification', description: 'Magnification (40x, 100x, 1000x)' },
    { pattern: /^\d+x\d+$/i, type: 'magnification', description: 'Binocular spec (8x42, 10x50)' },
    { pattern: /^\d+[-–]\d+x\d+$/i, type: 'magnification', description: 'Variable scope (3-9x40, 4-16x50)' },
    { pattern: /^wf\d+x$/i, type: 'magnification', description: 'Eyepiece (WF10x, WF15x)' },
    { pattern: /^\d+x\s*(zoom|optical)?$/i, type: 'magnification', description: 'Zoom (10x zoom, 30x optical)' },

    // ── Thread weight (sewing/embroidery) ────────────────────────────────────
    { pattern: /^\d+(wt|WT)$/, type: 'thread-weight', description: 'Thread weight (40wt, 50wt, 12wt)' },
    { pattern: /^nm\s*\d+$/i, type: 'needle-size', description: 'Metric needle size (Nm 80, Nm 90)' },
    { pattern: /^\d+\/\d+\s*needle$/i, type: 'needle-size', description: 'Needle size (14/90, 16/100)' },

    // ── Welding rod/wire codes ────────────────────────────────────────────────
    { pattern: /^e\d{4}$/i, type: 'welding', description: 'Welding rod (E6013, E7018)' },
    { pattern: /^er\d+s[-–]\d$/i, type: 'welding', description: 'Welding wire (ER70S-6, ER308L)' },

    // ── Scope adjustment ─────────────────────────────────────────────────────
    { pattern: /^\d+\/\d+\s*moa$/i, type: 'scope', description: 'MOA adjustment (1/4 MOA)' },
    { pattern: /^\d+(\.\d+)?\s*mrad$/i, type: 'scope', description: 'MRAD adjustment (0.1 MRAD)' },

    // ── 3D printing filament diameter ─────────────────────────────────────────
    { pattern: /^1\.75\s*mm\s*(filament)?$/i, type: '3d-print', description: '3D filament diameter (1.75mm)' },
    { pattern: /^2\.85\s*mm\s*(filament)?$/i, type: '3d-print', description: '3D filament diameter (2.85mm)' },
    { pattern: /^0\.4\s*mm\s*(nozzle)?$/i, type: '3d-print', description: 'Nozzle size (0.4mm nozzle)' },
    { pattern: /^0\.2\s*mm\s*(nozzle)?$/i, type: '3d-print', description: 'Nozzle size (0.2mm nozzle)' },
    { pattern: /^0\.6\s*mm\s*(nozzle)?$/i, type: '3d-print', description: 'Nozzle size (0.6mm nozzle)' },
    { pattern: /^0\.8\s*mm\s*(nozzle)?$/i, type: '3d-print', description: 'Nozzle size (0.8mm nozzle)' },

    // ── Bow draw weight ───────────────────────────────────────────────────────
    { pattern: /^\d+\s*lb\s*draw$/i, type: 'archery', description: 'Draw weight (30lb draw, 50lb draw)' },
    { pattern: /^\d+\s*inch\s*draw$/i, type: 'archery', description: 'Draw length (28 inch draw)' },

    // ── Lock security ────────────────────────────────────────────────────────
    { pattern: /^\d+\s*(lever|pin|disc)$/i, type: 'security', description: 'Lock mechanism (5 lever, 6 pin)' },
    { pattern: /^grade\s*[1-9]$/i, type: 'security', description: 'Security grade (Grade 1, Grade 3)' },
    { pattern: /^\d+\s*star\s*(rating)?$/i, type: 'security', description: 'Star security rating (3 star, 5 star)' },


    // ── Battery sizes ─────────────────────────────────────────────────────────
    { pattern: /^(aa|aaa|aaaa|c|d)\s*(battery|batteries|cell|cells)?$/i, type: 'battery', description: 'Battery size (AA, AAA, C, D)' },
    { pattern: /^cr\d{4}[a-z]?$/i, type: 'battery', description: 'Coin battery (CR2032, CR123A)' },
    { pattern: /^lr\d{2}[a-z]?$/i, type: 'battery', description: 'Button battery (LR44, LR41)' },
    { pattern: /^a\d{2}[a-z]?$/i, type: 'battery', description: 'Battery type (A23, A27)' },

    // ── Wire gauge ────────────────────────────────────────────────────────────
    { pattern: /^\d+\s*awg$/i, type: 'wire-gauge', description: 'AWG wire gauge (18 AWG, 22 AWG)' },
    { pattern: /^\d+\s*swg$/i, type: 'wire-gauge', description: 'SWG wire gauge (18 SWG, 22 SWG)' },

    // ── BTU heating/cooling ───────────────────────────────────────────────────
    { pattern: /^\d+\s*btu(\/h)?$/i, type: 'heating', description: 'BTU capacity (12000 BTU, 24000 BTU)' },
    { pattern: /^\d+k?\s*btu$/i, type: 'heating', description: 'BTU capacity (12kBTU)' },

    // ── Screen response time ──────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*ms\s*(response|gtg|mprt)?$/i, type: 'response', description: 'Response time (1ms, 4ms, 0.5ms)' },

    // ── Load rating ───────────────────────────────────────────────────────────
    { pattern: /^wll\s*\d+(\.\d+)?\s*(kg|t|ton)?$/i, type: 'load', description: 'Working Load Limit (WLL 1000kg)' },
    { pattern: /^swl\s*\d+(\.\d+)?\s*(kg|t|ton)?$/i, type: 'load', description: 'Safe Working Load (SWL 500kg)' },
    { pattern: /^mbl\s*\d+(\.\d+)?\s*(kg|kn)?$/i, type: 'load', description: 'Minimum Breaking Load' },
    { pattern: /^\d+(\.\d+)?\s*(tonne|ton)\s*(capacity|rated|swl|wll)?$/i, type: 'load', description: 'Load capacity in tonnes' },

    // ── Yarn weight ───────────────────────────────────────────────────────────
    { pattern: /^\d+\s*ply$/i, type: 'yarn', description: 'Yarn ply (4ply, 8ply, 10ply)' },

    // ── CE protection levels ──────────────────────────────────────────────────
    { pattern: /^ce\s*(level|lvl)\s*[12]$/i, type: 'protection', description: 'CE protection level (CE Level 1, CE Level 2)' },

    // ── HEPA grade ────────────────────────────────────────────────────────────
    { pattern: /^h\d{2}\s*(hepa)?$/i, type: 'filter', description: 'HEPA grade (H13, H14)' },

    // ── Seed generation ───────────────────────────────────────────────────────
    { pattern: /^f[12]\s*(hybrid|seed|variety)?$/i, type: 'seed', description: 'Seed generation (F1, F2 hybrid)' },

    // ── Coverage area ─────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*m²\s*(coverage)?$/i, type: 'coverage', description: 'Coverage area (10m², 15m²)' },
    { pattern: /^\d+(\.\d+)?\s*sq\s*(m|ft|meter|metre|feet)?$/i, type: 'coverage', description: 'Square metres/feet coverage' },

    // ── Chainsaw chain ────────────────────────────────────────────────────────
    { pattern: /^0\.\d{3}\s*(pitch|gauge)$/i, type: 'chainsaw', description: 'Chain pitch/gauge (0.325 pitch, 0.050 gauge)' },
    { pattern: /^3\/8\s*(pitch|chain)?$/i, type: 'chainsaw', description: 'Chain pitch (3/8 pitch)' },

    // ── Concrete grade ────────────────────────────────────────────────────────
    { pattern: /^c\d{2}\s*(concrete)?$/i, type: 'concrete', description: 'Concrete grade (C20, C25, C30)' },
    { pattern: /^st\d\s*(mix)?$/i, type: 'concrete', description: 'Concrete spec (ST2, ST4)' },
    { pattern: /^\d+\s*n\/mm²$/i, type: 'strength', description: 'Strength (25N/mm², 35N/mm²)' },


    // ── Bed sizes ─────────────────────────────────────────────────────────────
    { pattern: /^(single|double|king|queen|super\s*king|small\s*double|european\s*king)\s*(size|bed)?$/i, type: 'bed-size', description: 'Bed size (single, double, king, super king)' },
    { pattern: /^(3|4|4\.5|5|6)\s*ft\s*(bed|mattress)?$/i, type: 'bed-size', description: 'Bed width in feet (3ft, 4ft6, 5ft, 6ft)' },
    { pattern: /^(90|120|135|150|160|180|200)\s*x\s*(190|200)\s*cm$/i, type: 'bed-size', description: 'Mattress dimensions (90x190cm, 150x200cm)' },

    // ── Mattress spring count ──────────────────────────────────────────────────
    { pattern: /^\d{3,4}\s*(pocket\s*(spring)?|spring|coil)$/i, type: 'spring-count', description: 'Spring count (1000 pocket, 2000 spring)' },

    // ── Tile slip resistance ──────────────────────────────────────────────────
    { pattern: /^r\d{2}$/i, type: 'slip-rating', description: 'Slip resistance R10-R13' },
    { pattern: /^p[3-5]$/i, type: 'slip-rating', description: 'Pendulum slip rating P3-P5' },
    { pattern: /^a\+b\+c$/i, type: 'slip-rating', description: 'Slip classification A+B+C' },

    // ── Camera mounts ─────────────────────────────────────────────────────────
    { pattern: /^(ef|rf|ef-s|ef-m|f|z|e|fe|m43|m4\/3|pl|l|sa|sr|k|x)\s*mount$/i, type: 'camera-mount', description: 'Camera lens mount (EF mount, RF mount, E mount)' },

    // ── Audio impedance ───────────────────────────────────────────────────────
    { pattern: /^\d+\s*ohm(s)?$/i, type: 'impedance', description: 'Impedance (16 ohm, 32 ohm, 600 ohm)' },
    { pattern: /^\d+\s*Ω$/, type: 'impedance', description: 'Impedance symbol (32Ω, 600Ω)' },

    // ── Medical compression ───────────────────────────────────────────────────
    { pattern: /^\d{2}-\d{2}\s*mmhg$/i, type: 'compression', description: 'Compression pressure (15-21 mmHg)' },
    { pattern: /^compression\s*(class|grade)\s*[1-4]$/i, type: 'compression', description: 'Compression class (Class 1, Class 2)' },

    // ── Glass specifications ───────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*u[-\s]?value$/i, type: 'thermal', description: 'U-value thermal performance (1.0 u-value)' },
    { pattern: /^u[-\s]?value\s*\d+(\.\d+)?$/i, type: 'thermal', description: 'U-value spec' },

    // ── Nutrition ─────────────────────────────────────────────────────────────
    { pattern: /^\d+\s*kcal(\s*per\s*(100g|serving|portion))?$/i, type: 'nutrition', description: 'Calories (200 kcal, 500 kcal per serving)' },
    { pattern: /^\d+\s*kj(\s*per\s*(100g|serving))?$/i, type: 'nutrition', description: 'Kilojoules (840 kJ)' },
    { pattern: /^\d+g\s*(protein|carb|fat|fibre|fiber|sugar|salt)$/i, type: 'nutrition', description: 'Macros per serving (25g protein)' },

    // ── Storage types ─────────────────────────────────────────────────────────
    { pattern: /^ufs\s*\d+(\.\d+)?$/i, type: 'storage', description: 'UFS storage (UFS 3.1, UFS 2.1)' },
    { pattern: /^gddr\d+[x]?$/i, type: 'memory', description: 'Graphics memory (GDDR6, GDDR6X)' },
    { pattern: /^emmc\s*\d+(\.\d+)?$/i, type: 'storage', description: 'eMMC storage version' },

    // ── Curtain header type ────────────────────────────────────────────────────
    { pattern: /^(eyelet|pencil\s*pleat|pinch\s*pleat|tab\s*top|rod\s*pocket|ring\s*top|wave)\s*(header|top|heading)?$/i, type: 'curtain-header', description: 'Curtain header type' },

    // ── Car seat standards ────────────────────────────────────────────────────
    { pattern: /^group\s*[0-4](\+)?$/i, type: 'car-seat', description: 'Car seat group (Group 0, Group 1, Group 2/3)' },
    { pattern: /^\d{1,2}-\d{1,2}\s*kg\s*(group)?$/i, type: 'car-seat', description: 'Car seat weight range (9-18kg)' },
    { pattern: /^(ece\s*r\d+|r44|r129)$/i, type: 'car-seat', description: 'Car seat standard (ECE R129, R44)' },


    // ── Watch water resistance ────────────────────────────────────────────────
    { pattern: /^\d+\s*atm\s*(water\s*resistant)?$/i, type: 'water-resistance', description: 'ATM water resistance (5 ATM, 10 ATM, 20 ATM)' },
    { pattern: /^wr\d+$/i, type: 'water-resistance', description: 'WR water resistance (WR50, WR100, WR200)' },

    // ── Sunglass lens category ────────────────────────────────────────────────
    { pattern: /^cat(egory)?\s*[0-4]$/i, type: 'lens-category', description: 'Lens category (Cat 0, Cat 3, Category 4)' },

    // ── Ring sizes ────────────────────────────────────────────────────────────
    { pattern: /^(ring\s*)?size\s*[a-z]$/i, type: 'ring-size', description: 'UK ring size (Size J, Size N, Size T)' },
    { pattern: /^(ring\s*)?size\s*\d+(\.\d+)?$/i, type: 'ring-size', description: 'US/EU ring size (Size 6, Size 7.5)' },

    // ── Fabric wash temperature ────────────────────────────────────────────────
    { pattern: /^(\d+)°?\s*[cC]\s*(wash|max|degree)?$/, type: 'wash-temp', description: 'Wash temperature (30°C, 40°C, 60°C)' },
    { pattern: /^(cold|warm|hot)\s*wash$/i, type: 'wash-temp', description: 'Wash temperature descriptor' },

    // ── Fabric composition ────────────────────────────────────────────────────
    { pattern: /^\d+%\s*(cotton|polyester|wool|silk|linen|bamboo|acrylic|nylon|elastane|lycra|spandex|viscose|modal|tencel|cashmere|merino|fleece|denim|canvas|leather|suede|polyurethane|pu|eva|rubber|latex)$/i, type: 'fabric', description: 'Fabric composition (100% cotton, 95% polyester)' },
    { pattern: /^(\d+%\s*\w+\s*){2,4}$/i, type: 'fabric', description: 'Fabric blend (50% cotton 50% polyester)' },

    // ── Plating thickness ─────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*micron(s)?$/i, type: 'plating', description: 'Plating thickness (5 micron, 3 micron)' },

    // ── Surge protection ──────────────────────────────────────────────────────
    { pattern: /^\d+\s*joule(s)?\s*(surge|protection)?$/i, type: 'surge', description: 'Surge protection (900 joule, 1080 joule)' },

    // ── Socket count ──────────────────────────────────────────────────────────
    { pattern: /^\d+\s*(socket|gang|outlet|way|port)s?\s*(extension|lead|plug|strip)?$/i, type: 'sockets', description: 'Socket count (3 socket, 6 gang, 4 outlet)' },

    // ── Networking speed ──────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?g\s*(ethernet|lan|network|sfp|qsfp)?$/i, type: 'network', description: 'Network speed (2.5G ethernet, 10G, 25G SFP)' },
    { pattern: /^\d+\s*mtu$/i, type: 'network', description: 'MTU size (9000 MTU)' },

    // ── Multi-voltage ranges ──────────────────────────────────────────────────
    { pattern: /^\d+[-–]\d+\s*v$/i, type: 'voltage', description: 'Voltage range (110-240V, 100-240V)' },
    { pattern: /^\d+v[-–]\d+v$/i, type: 'voltage', description: 'Voltage range (110V-240V)' },
    { pattern: /^\d+\/\d+\s*v$/i, type: 'voltage', description: 'Dual voltage (110/220V, 120/240V)' },
    { pattern: /^\d+\/\d+\s*hz$/i, type: 'frequency', description: 'Dual frequency (50/60Hz)' },

    // ── Baby clothing/nappy sizes ─────────────────────────────────────────────
    { pattern: /^size\s*[1-7]\s*(nappy|diaper|pull[- ]?up)?$/i, type: 'size', description: 'Nappy size (Size 1, Size 4)' },
    { pattern: /^(newborn|tiny\s*baby|premature|prem)\s*size?$/i, type: 'size', description: 'Baby size (Newborn, Tiny Baby)' },
    { pattern: /^(0-3|3-6|6-9|6-12|9-12|12-18|18-24)\s*(m|mth|month|months)$/i, type: 'size', description: 'Baby age size' },

    // ── Watch movement types ──────────────────────────────────────────────────
    { pattern: /^(automatic|quartz|mechanical|kinetic|solar|eco[-\s]?drive|spring\s*drive)\s*(movement|watch)?$/i, type: 'movement', description: 'Watch movement (automatic, quartz)' },
    { pattern: /^(chronograph|chronometer|tachymeter|tourbillon|perpetual\s*calendar)\s*(function|complication)?$/i, type: 'complication', description: 'Watch complication' },

    // ── Water resistance (watches/speakers) ──────────────────────────────────
    { pattern: /^\d+\s*(m|metre|meter)\s*water\s*(resistant|proof|resistance)$/i, type: 'water-resistance', description: 'Water resistance depth (50m, 100m)' },
    { pattern: /^water\s*(resistant|proof)\s*\d+\s*(m|atm|bar)$/i, type: 'water-resistance', description: 'Water resistance spec' },

    // ── Audio sensitivity & response ─────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*hz[-–]\d+(\.\d+)?\s*(k?hz)$/i, type: 'audio', description: 'Frequency response (20Hz-20kHz)' },
    { pattern: /^(rms|peak|program|music)\s*power\s*\d+(\.\d+)?\s*w$/i, type: 'power', description: 'Audio power (RMS power 50W)' },
    { pattern: /^\d+(\.\d+)?\s*w\s*(rms|peak|program|music)$/i, type: 'power', description: 'Audio wattage (50W RMS)' },
    { pattern: /^sensitivity\s*\d+(\.\d+)?\s*(db|dba|dbc)?$/i, type: 'audio', description: 'Speaker sensitivity (90dB)' },
    { pattern: /^snr\s*\d+\s*(db)?$/i, type: 'audio', description: 'Signal-to-noise ratio (SNR 90dB)' },
    { pattern: /^thd\s*[<≤]?\s*\d+(\.\d+)?\s*%$/i, type: 'audio', description: 'THD percentage (THD <0.1%)' },

    // ── Pool / Spa specs ──────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*(ppm|ppm\s*chlorine|ppm\s*salt)$/i, type: 'chemistry', description: 'Parts per million (1.5 ppm)' },
    { pattern: /^\d+(\.\d+)?\s*(gph|lph|gpm|lpm)\s*(flow|pump)?$/i, type: 'flow', description: 'Flow rate (500 GPH, 800 LPH)' },

    // ── Ladder / Height specs ─────────────────────────────────────────────────
    { pattern: /^(class\s*)?(1|i|ii|iii|en131|en14183)\s*(ladder|step)?$/i, type: 'grade', description: 'Ladder class (Class 1, EN131)' },
    { pattern: /^\d+(\.\d+)?\s*(tread|step|rung)s?$/i, type: 'spec', description: 'Ladder steps (3 step, 5 tread)' },
    { pattern: /^\d+(\.\d+)?\s*m?\s*(working|platform)\s*height$/i, type: 'height', description: 'Platform height (1.4m working height)' },

    // ── Air quality / HVAC ───────────────────────────────────────────────────
    { pattern: /^cadr\s*\d+(\.\d+)?\s*(m³\/h|cfm)?$/i, type: 'air-quality', description: 'CADR rating for air purifiers' },
    { pattern: /^\d+(\.\d+)?\s*m³\/h$/i, type: 'flow', description: 'Air flow rate m³/h' },
    { pattern: /^\d+(\.\d+)?\s*cfm$/i, type: 'flow', description: 'Cubic feet per minute' },
    { pattern: /^pm\s*2\.5$/i, type: 'air-quality', description: 'PM2.5 particle filtration' },
    { pattern: /^pm\s*10$/i, type: 'air-quality', description: 'PM10 particle filtration' },
    { pattern: /^(seer|eer|cop)\s*\d+(\.\d+)?$/i, type: 'efficiency', description: 'Efficiency rating (SEER 20, COP 3.5)' },

    // ── Telescope / Microscope ────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*mm\s*(aperture|objective|eyepiece)$/i, type: 'optics', description: 'Optical aperture/objective' },
    { pattern: /^f\/?\d+(\.\d+)?$/i, type: 'optics', description: 'Focal ratio (f/10, f/5.6)' },
    { pattern: /^\d+(\.\d+)?\s*mm\s*fl$/i, type: 'optics', description: 'Focal length (900mm FL)' },
    { pattern: /^\d+(\.\d+)?\s*mm\s*focal/i, type: 'optics', description: 'Focal length written out' },

    // ── Paper/Craft ───────────────────────────────────────────────────────────
    { pattern: /^\d+\s*(sheet|leaf|leaves)s?$/i, type: 'quantity', description: 'Sheet count (50 sheets, 100 leaves)' },
    { pattern: /^\d+\s*page(s)?$/i, type: 'quantity', description: 'Page count (200 pages)' },
    { pattern: /^\d+(\.\d+)?\s*(gsm|g\/m²)$/i, type: 'fabric', description: 'Paper/fabric weight (80gsm, 300g/m²)' },

    // ── Bike / Cycling specs ──────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*speed$/i, type: 'cycling', description: 'Gear speeds (21 speed, 11 speed)' },
    { pattern: /^(700c|26"|27\.5"|29")\s*(wheel)?$/i, type: 'cycling', description: 'Wheel size (700c, 29 inch)' },
    { pattern: /^\d+(\.\d+)?\s*mm\s*(brake|rotor|disc)$/i, type: 'cycling', description: 'Brake/rotor size (160mm disc)' },
    { pattern: /^(rigid|hardtail|full\s*suspension|xc|trail|enduro|dh)\s*(frame|fork)?$/i, type: 'cycling', description: 'Bike type (rigid, hardtail, full suspension)' },

    // ── Motor / RC specs ─────────────────────────────────────────────────────
    { pattern: /^\d+kv\s*(motor)?$/i, type: 'rc', description: 'Motor KV rating (2300KV)' },
    { pattern: /^\d+s\s*(lipo|battery)?$/i, type: 'rc', description: 'Battery cells (2S, 3S, 4S LiPo)' },
    { pattern: /^\d+(\.\d+)?\s*c\s*(rating|discharge)?$/i, type: 'rc', description: 'Discharge rate (25C, 50C rating)' },
    { pattern: /^(1\/\d+|1:\d+)\s*(scale)?$/i, type: 'rc', description: 'Scale (1/10, 1:8 scale)' },

    // ── Solar / Power station ─────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*wh\s*(capacity)?$/i, type: 'energy', description: 'Watt-hour capacity (500Wh, 1000Wh)' },
    { pattern: /^\d+(\.\d+)?\s*kwh\s*(capacity)?$/i, type: 'energy', description: 'kWh capacity (1kWh, 2kWh)' },
    { pattern: /^\d+(\.\d+)?\s*(w|watt)s?\s*(solar|panel|pv)?$/i, type: 'power', description: 'Solar wattage (100W solar, 200W panel)' },

    // ── Archery specs ─────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?"\s*(arrow|shaft|spine)?$/i, type: 'archery', description: 'Arrow length in inches' },
    { pattern: /^\d+\s*spine$/i, type: 'archery', description: 'Arrow spine stiffness (400 spine)' },
    { pattern: /^amo\s*draw$/i, type: 'archery', description: 'AMO draw length standard' },

    // ── Sewing machine ────────────────────────────────────────────────────────
    { pattern: /^\d+\s*(stitch|spm)\s*(type|pattern|per\s*min)?$/i, type: 'sewing', description: 'Stitch count (15 stitch, 700 SPM)' },
    { pattern: /^(domestic|industrial|overlocker|serger)\s*(machine)?$/i, type: 'sewing', description: 'Machine type' },

    // ── Spray / Nozzle ────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*bar\s*(max|pressure|rated)?$/i, type: 'pressure', description: 'Pressure bar rating (130 bar, 165 bar)' },
    { pattern: /^\d+(\.\d+)?\s*l\/min$/i, type: 'flow', description: 'Flow litres per minute (8L/min)' },
    { pattern: /^\d+(\.\d+)?\s*(m|metre|meter)\s*(reach|lance)?$/i, type: 'spec', description: 'Lance reach (5m lance)' },

    // ── Camping / Outdoor ─────────────────────────────────────────────────────
    { pattern: /^(1|2|3|4|5|6|8|10)[- ]?(person|man|men|berth|season)(\s*tent)?$/i, type: 'camping', description: 'Tent capacity (2 person, 4 man)' },
    { pattern: /^(1|2|3|4)[- ]?season(\s*tent|sleeping\s*bag)?$/i, type: 'camping', description: 'Season rating (3 season, 4 season)' },
    { pattern: /^(down|synthetic|hollow\s*fibre)\s*(fill|insulation)?$/i, type: 'camping', description: 'Sleeping bag fill type' },
    { pattern: /^\d+\s*g\s*(down|fill)?$/i, type: 'camping', description: 'Down fill weight (500g down)' },
    { pattern: /^\d+\s*fill\s*(power|rating)?$/i, type: 'camping', description: 'Fill power (600 fill, 800 fill power)' },
    { pattern: /^-?\d+\s*°?\s*(c|f)\s*(comfort|limit|extreme)?$/i, type: 'temperature', description: 'Sleeping bag temp rating (-10°C comfort)' },

    // ── Chain / Chainsaw ─────────────────────────────────────────────────────
    { pattern: /^\d+\s*(link|drive\s*link)s?$/i, type: 'chainsaw', description: 'Chain link count (57 link, 72 drive links)' },
    { pattern: /^\d+"\s*(bar|guide\s*bar)?$/i, type: 'chainsaw', description: 'Bar length in inches (16" bar)' },

    // ── Supplement form ───────────────────────────────────────────────────────
    { pattern: /^\d+\s*(capsule|tablet|sachet|serving|scoop)s?$/i, type: 'quantity', description: 'Supplement quantity (60 capsules, 30 servings)' },
    { pattern: /^\d+\s*day\s*(supply|worth)?$/i, type: 'quantity', description: 'Supply duration (30 day supply)' },

    // ── Candle specs ──────────────────────────────────────────────────────────
    { pattern: /^\d+\s*(hour|hr)\s*(burn\s*time?|burn)?$/i, type: 'candle', description: 'Burn time (40 hour burn, 60hr)' },
    { pattern: /^\d+(\.\d+)?\s*oz\s*(wax|candle)?$/i, type: 'candle', description: 'Candle wax weight (8oz candle)' },
    { pattern: /^\d+\s*(cl|centilitre|centiliter)\s*(candle|glass)?$/i, type: 'candle', description: 'Candle volume' },

    // ── Pen / Marker ─────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*mm\s*(nib|tip|point|line\s*width)?$/i, type: 'spec', description: 'Nib/tip size (0.5mm nib, 1mm tip)' },
    { pattern: /^(extra\s*fine|fine|medium|broad|stub|italic)\s*(nib|tip|point)?$/i, type: 'spec', description: 'Nib type (fine, medium, broad)' },

    // ── Solar panel output ────────────────────────────────────────────────────
    { pattern: /^oc\s*\d+(\.\d+)?\s*v$/i, type: 'solar', description: 'Open circuit voltage (OC 22V)' },
    { pattern: /^voc\s*\d+(\.\d+)?$/i, type: 'solar', description: 'Voc spec' },
    { pattern: /^isc\s*\d+(\.\d+)?$/i, type: 'solar', description: 'Isc spec' },

    // ── Lock mechanism ────────────────────────────────────────────────────────
    { pattern: /^\d+\s*digit\s*(combination|code)?$/i, type: 'security', description: 'Combination digits (3 digit, 4 digit)' },
    { pattern: /^\d+\s*(lever|pin|disc|tumbler)s?\s*(lock)?$/i, type: 'security', description: 'Lock mechanism (5 lever, 6 pin)' },

    // ── Fence / Panel ─────────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*m\s*(x)\s*\d+(\.\d+)?\s*m$/i, type: 'dimension', description: 'Panel dimensions (1.8m x 0.9m)' },
    { pattern: /^(close\s*board|lap|feather\s*edge|picket|ranch|trellis)\s*(fence|panel|fencing)?$/i, type: 'spec', description: 'Fence type' },

    // ── Footwear width ───────────────────────────────────────────────────────
    { pattern: /^(narrow|standard|wide|extra\s*wide|2e|4e|ee|eee)\s*(fit|width)?$/i, type: 'width', description: 'Shoe width fitting' },
    { pattern: /^width\s*(b|d|e|ee|eee|eeee)$/i, type: 'width', description: 'Shoe width code' },

    // ── Curtain drop / width ──────────────────────────────────────────────────
    { pattern: /^\d+"\s*x\s*\d+"$/i, type: 'dimension', description: 'Curtain/fabric size in inches (66"x72")' },
    { pattern: /^\d+"\s*(drop|width|wide|long)$/i, type: 'dimension', description: 'Single curtain measurement (72" drop)' },

    // ── Pack Quantities ───────────────────────────────────────────────────────
    { pattern: /^\d+\s*(pack|pcs|pc|piece|pieces|pairs?|set|count|ct)$/i, type: 'quantity', description: 'Pack quantity (10 pack, 5 pcs)' },
    { pattern: /^x\d+$/i, type: 'quantity', description: 'Multiplier (x2, x3, x10)' },
    { pattern: /^\d+x$/i, type: 'quantity', description: 'Multiplier (2x, 3x)' },

    // ── Jewellery specs ───────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*ct\s*(diamond|gem|stone|total)?$/i, type: 'jewellery', description: 'Carat weight (0.5ct, 1ct diamond)' },
    { pattern: /^\d+(\.\d+)?\s*carat\s*(diamond|gold|gem)?$/i, type: 'jewellery', description: 'Carat weight written out' },
    { pattern: /^(d|e|f|g|h|i|j|k|l|m)\s*(colour|color)\s*(grade)?$/i, type: 'jewellery', description: 'Diamond colour grade (D, G, H colour)' },
    { pattern: /^(if|vvs1|vvs2|vs1|vs2|si1|si2|i1|i2|i3)\s*(clarity)?$/i, type: 'jewellery', description: 'Diamond clarity (VS1, SI2, VVS1)' },
    { pattern: /^(ideal|excellent|very\s*good|good|fair|poor)\s*(cut)?$/i, type: 'jewellery', description: 'Diamond cut grade' },
    { pattern: /^(round|princess|cushion|oval|pear|emerald|asscher|radiant|marquise|heart)\s*(cut|shape|brilliant)?$/i, type: 'jewellery', description: 'Diamond/gem cut shape' },
    { pattern: /^\d{3,4}\s*(hallmark|fineness)$/i, type: 'jewellery', description: 'Metal fineness (925, 750, 585)' },
    { pattern: /^(gia|igi|egl|ags|hrd)\s*(certified|cert|graded)?$/i, type: 'jewellery', description: 'Gem certificate (GIA, IGI, EGL)' },
    { pattern: /^(ring|bracelet|necklace|chain)\s*size\s*[a-z\d]+$/i, type: 'jewellery', description: 'Jewellery size' },
    { pattern: /^\d+(\.\d+)?\s*(inch|cm|mm)\s*(chain|necklace|bracelet)?$/i, type: 'jewellery', description: 'Chain/necklace length' },

    // ── Phone/Mobile specs ────────────────────────────────────────────────────
    { pattern: /^(single|dual|triple|nano|micro|e)\s*sim$/i, type: 'phone', description: 'SIM type (dual SIM, nano SIM)' },
    { pattern: /^(unlocked|locked|sim\s*free|network\s*locked)$/i, type: 'phone', description: 'Network lock status' },
    { pattern: /^android\s*\d+(\.\d+)?$/i, type: 'phone', description: 'Android version (Android 14)' },
    { pattern: /^ios\s*\d+(\.\d+)?$/i, type: 'phone', description: 'iOS version (iOS 17)' },
    { pattern: /^\d+(\.\d+)?\s*inch\s*(screen|display)?$/i, type: 'display', description: 'Screen size (6.1 inch screen)' },
    { pattern: /^(gorilla\s*glass\s*)?(victus|7i|6|5|4|3|2|1)$/i, type: 'display', description: 'Gorilla Glass version' },

    // ── Gaming specs ──────────────────────────────────────────────────────────
    { pattern: /^(dlss|fsr|xess)\s*(\d+(\.\d+)?)?$/i, type: 'gaming', description: 'Upscaling tech (DLSS 3, FSR 2)' },
    { pattern: /^(g.sync|freesync|adaptive\s*sync|vrr)(\s*premium)?$/i, type: 'gaming', description: 'Sync technology' },
    { pattern: /^ray\s*trac(ing|er)$/i, type: 'gaming', description: 'Ray tracing support' },
    { pattern: /^\d+(\.\d+)?\s*gb\s*vram$/i, type: 'gaming', description: 'VRAM amount (8GB VRAM)' },
    { pattern: /^(ps4|ps5|xbox|switch|pc|steam)\s*(exclusive|version|edition)?$/i, type: 'gaming', description: 'Gaming platform' },
    { pattern: /^(pal|ntsc|ntsc.j|region\s*free|all\s*regions?)$/i, type: 'gaming', description: 'Game region' },

    // ── Medical/Health specs ──────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*bpm$/i, type: 'medical', description: 'Beats per minute (60 BPM)' },
    { pattern: /^\d+(\.\d+)?\s*spo2\s*%?$/i, type: 'medical', description: 'Blood oxygen (98% SpO2)' },
    { pattern: /^\d+(\.\d+)?\s*mmol\/l$/i, type: 'medical', description: 'Blood glucose (7.0 mmol/L)' },
    { pattern: /^(class\s*i{1,3}|class\s*[1-3])\s*(medical|laser|device)?$/i, type: 'medical', description: 'Medical device class' },
    { pattern: /^(tens|ems|nmes)\s*(unit|machine|device)?$/i, type: 'medical', description: 'Electrical therapy type' },
    { pattern: /^(cpap|bipap|apap)\s*(machine|device|pressure)?$/i, type: 'medical', description: 'Sleep apnea device' },
    { pattern: /^\d+(\.\d+)?\s*hz\s*(tens|frequency|pulse)?$/i, type: 'medical', description: 'TENS frequency' },
    { pattern: /^\d+(\.\d+)?\s*(ma|milliamp)\s*(tens|output)?$/i, type: 'medical', description: 'TENS output' },
    { pattern: /^(en|iso|astm)\s*\d+[-\s]?\d*$/i, type: 'standard', description: 'Medical/safety standard' },

    // ── Automotive specs ──────────────────────────────────────────────────────
    { pattern: /^\d{4}\s*[-–]\s*\d{4}$/, type: 'automotive', description: 'Year range fitment (2015-2020)' },
    { pattern: /^\d+(\.\d+)?\s*(litre|liter|l)\s*(engine|v\d+)?$/i, type: 'automotive', description: 'Engine size (2.0 litre, 3.5L V6)' },
    { pattern: /^(petrol|diesel|hybrid|electric|phev|mhev|fhev|hev)$/i, type: 'automotive', description: 'Fuel type' },
    { pattern: /^(manual|automatic|cvt|dct|amt|semi.auto)\s*(gearbox|transmission)?$/i, type: 'automotive', description: 'Gearbox type' },
    { pattern: /^(2wd|4wd|awd|fwd|rwd|4x4)\s*(drive)?$/i, type: 'automotive', description: 'Drive type (4WD, AWD, FWD)' },
    { pattern: /^(saloon|hatchback|estate|suv|coupe|convertible|pickup|van|mpv)\s*(body)?$/i, type: 'automotive', description: 'Car body type' },
    { pattern: /^\d+\s*(door|dr)s?$/i, type: 'automotive', description: 'Number of doors (3 door, 5dr)' },
    { pattern: /^euro\s*[1-7]$/i, type: 'automotive', description: 'Euro emission standard (Euro 6)' },
    { pattern: /^\d{3}\/\d{2}\s*(r|zr)?\d{2}\s*(c|xc|m\+s)?$/i, type: 'tyre', description: 'Tyre size (225/45R17)' },
    { pattern: /^(summer|winter|all.season|all.weather)\s*(tyre|tire)?$/i, type: 'tyre', description: 'Tyre season type' },

    // ── Books/Media specs ─────────────────────────────────────────────────────
    { pattern: /^(hardback|hardcover|paperback|softcover|mass\s*market|trade\s*paperback)$/i, type: 'format', description: 'Book format' },
    { pattern: /^(abridged|unabridged)\s*(edition|version|audiobook)?$/i, type: 'format', description: 'Audiobook type' },
    { pattern: /^\d+\s*page(s)?$/i, type: 'books', description: 'Page count (320 pages)' },
    { pattern: /^(4k|bluray|blu.ray|dvd|uhd|steelbook|digipak)\s*(edition)?$/i, type: 'media', description: 'Media format (4K Blu-ray, Steelbook)' },
    { pattern: /^(dolby\s*atmos|dts.x|thx|imax)\s*(audio|enhanced)?$/i, type: 'media', description: 'Audio format on media' },

    // ── Drone/FPV specs ───────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*min\s*(flight|hover|battery)\s*(time)?$/i, type: 'drone', description: 'Flight time (30 min flight time)' },
    { pattern: /^\d+(\.\d+)?\s*(km|m)\s*(range|transmission|video)?$/i, type: 'drone', description: 'Drone range (10km range)' },
    { pattern: /^\d+k\s*(video|camera)?$/i, type: 'drone', description: 'Video resolution (4K video)' },
    { pattern: /^(fhd|2.7k|4k|5.4k|6k)\s*(video|camera|footage)?$/i, type: 'drone', description: 'Drone camera quality' },

    // ── Hair extension specs ───────────────────────────────────────────────────
    { pattern: /^\d+\s*(inch|")\s*(hair|extension|tape|weft|clip|bundle)?$/i, type: 'hair', description: 'Hair extension length (18 inch, 22")' },
    { pattern: /^\d+g\s*(hair|weft|bundle|pack)?$/i, type: 'hair', description: 'Hair weight (100g bundle)' },
    { pattern: /^(remy|virgin|human|synthetic|heat\s*resistant)\s*(hair)?$/i, type: 'hair', description: 'Hair type (Remy, Virgin, Human)' },
    { pattern: /^(straight|wavy|curly|kinky|afro|coily)\s*(hair)?$/i, type: 'hair', description: 'Hair texture (straight, wavy, curly)' },

    // ── Musical instrument extras ──────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*(inch|")\s*(speaker|woofer|tweeter|driver|sub)$/i, type: 'audio', description: 'Speaker driver size (12 inch woofer)' },
    { pattern: /^(8|10|12|15|18)\s*inch\s*(bass|guitar|drum|speaker)?$/i, type: 'music', description: 'Instrument size in inches' },
    { pattern: /^(standard|baritone|tenor|soprano|alto|bass|treble)\s*(guitar|ukulele|sax)?$/i, type: 'music', description: 'Instrument voice/size' },
    { pattern: /^(nickel|steel|bronze|phosphor\s*bronze|nylon|gut)\s*(string|strings|wound)?$/i, type: 'music', description: 'String material' },
    { pattern: /^\.(0[0-9]\d)\s*(gauge|string)?$/i, type: 'music', description: 'String gauge (.009, .010, .012)' },
    { pattern: /^(\d+[-–]\d+)\s*(gauge|string\s*set)?$/i, type: 'music', description: 'String set gauge (9-42, 10-46)' },

    // ── Food/Beverage specs ───────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*(kcal|cal|kj)\s*(per\s*\d+g)?$/i, type: 'nutrition', description: 'Calorie content' },
    { pattern: /^\d+(\.\d+)?\s*g\s*(protein|carbs|fat|fibre|fiber|sugar|salt)\s*(per\s*\d+g)?$/i, type: 'nutrition', description: 'Macro per serving' },
    { pattern: /^(best\s*before|use\s*by|bb)\s*\d{2}\/\d{2,4}$/i, type: 'date', description: 'Best before date' },
    { pattern: /^(alcohol|abv)\s*\d+(\.\d+)?\s*%?$/i, type: 'alcohol', description: 'Alcohol by volume (ABV 5%)' },
    { pattern: /^\d+(\.\d+)?\s*%\s*(abv|vol|alcohol)?$/i, type: 'alcohol', description: 'Alcohol percentage (5% ABV)' },
    { pattern: /^e\d{3}[a-z]?$/i, type: 'additive', description: 'Food additive code (E471, E322)' },

    // ── Security/Lock extra ───────────────────────────────────────────────────
    { pattern: /^(bs|en|ansi)\s*(3621|8621|8623|12209|1303)\s*(euro|rim|mortice|deadlock)?$/i, type: 'security', description: 'Lock standard (BS3621, EN12209)' },
    { pattern: /^(assa|abloy|cisa|ingersoll|yale|banham|mul.t.lock)\s*(grade|class)?$/i, type: 'security', description: 'Lock brand spec' },
    { pattern: /^(sold\s*secure|thatcham|insurance\s*approved)\s*(gold|silver|bronze|diamond|cat\s*[123])?$/i, type: 'security', description: 'Security certification' },

    // ── Mattress spring/foam ──────────────────────────────────────────────────
    { pattern: /^\d{3,4}\s*(pocket\s*spring|spring|coil|pocket)s?$/i, type: 'mattress', description: 'Spring count (1000 pocket, 2000 springs)' },
    { pattern: /^(open\s*coil|pocket\s*spring|memory\s*foam|latex|hybrid|gel\s*foam|reflex\s*foam)\s*(mattress)?$/i, type: 'mattress', description: 'Mattress type' },
    { pattern: /^\d+(\.\d+)?\s*(cm|inch)\s*(thick|depth|height)\s*(mattress)?$/i, type: 'mattress', description: 'Mattress thickness (25cm thick)' },
    { pattern: /^(firm|medium|soft|plush|pillow\s*top|euro\s*top)\s*(feel|tension|comfort)?$/i, type: 'mattress', description: 'Mattress firmness (firm, medium, soft)' },

    // ── Welding extra ─────────────────────────────────────────────────────────
    { pattern: /^(mig|tig|mma|stick|plasma|spot|seam)\s*(welder|welding)?$/i, type: 'welding', description: 'Welding type (MIG, TIG, MMA)' },
    { pattern: /^\d+(\.\d+)?\s*mm\s*(wire|electrode|rod)\s*(diameter)?$/i, type: 'welding', description: 'Welding wire/rod diameter' },
    { pattern: /^(co2|argon|mixed\s*gas|no\s*gas|gasless)\s*(welding)?$/i, type: 'welding', description: 'Welding gas type' },
    { pattern: /^(duty\s*cycle\s*)?\d+\s*%\s*(duty\s*cycle)?$/i, type: 'welding', description: 'Duty cycle percentage' },

    // ── Plumbing/Heating ──────────────────────────────────────────────────────
    { pattern: /^(combi|system|heat.only|back\s*boiler|condensing)\s*(boiler)?$/i, type: 'heating', description: 'Boiler type (combi, system, heat only)' },
    { pattern: /^\d+(\.\d+)?\s*kw\s*(output|boiler|heater)?$/i, type: 'heating', description: 'Boiler/heater output (24kW, 35kW)' },
    { pattern: /^(a|a\+|a\+\+|a\+\+\+)\s*(rated|energy\s*rating)?$/i, type: 'efficiency', description: 'Energy rating (A+, A++ rated)' },
    { pattern: /^(erp|eup)\s*(compliant|rated|class\s*[a-g])?$/i, type: 'efficiency', description: 'Energy regulation compliance' },

    // ── Fitness equipment ─────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*kg\s*(dumbbell|weight|plates?|barbell|kettlebell)?$/i, type: 'fitness', description: 'Weight equipment mass (10kg dumbbell)' },
    { pattern: /^\d+(\.\d+)?\s*lb\s*(weight|plates?|dumbbell)?$/i, type: 'fitness', description: 'Weight in pounds (20lb weight)' },
    { pattern: /^(\d+[-–]\d+\s*kg|\d+\s*kg\s*max)\s*(resistance|weight\s*stack)?$/i, type: 'fitness', description: 'Resistance/weight stack range' },
    { pattern: /^\d+(\.\d+)?\s*(mets|vo2\s*max|calories\/hr)\s*$/i, type: 'fitness', description: 'Fitness metric (METs, VO2 max)' },
    { pattern: /^(incline|decline)\s*\d+\s*(°|degree|%|percent)?$/i, type: 'fitness', description: 'Treadmill/bench incline angle' },

    // ── Electrical outlet/switch ───────────────────────────────────────────────
    { pattern: /^(single|double|triple|twin)\s*(socket|outlet|plug|pole|switched)$/i, type: 'electrical', description: 'Socket configuration (single, double)' },
    { pattern: /^(spst|spdt|dpst|dpdt|sp|dp)\s*(switch|relay)?$/i, type: 'electrical', description: 'Switch configuration (SPDT, DPDT)' },
    { pattern: /^(normally\s*open|normally\s*closed|no|nc)\s*(contact|relay)?$/i, type: 'electrical', description: 'Relay contact type (NO, NC)' },
    { pattern: /^ip\s*(20|22|44|54|55|65|66|67|68|69k?)\s*(rated|rating)?$/i, type: 'protection', description: 'IP protection rating' },

    // ── Perfume / Fragrance ───────────────────────────────────────────────────
    { pattern: /^(edp|edt|edc|parfum|extrait)\s*(spray|roll[- ]on)?$/i, type: 'fragrance', description: 'Fragrance concentration (EDP, EDT, EDC)' },
    { pattern: /^\d+(\.\d+)?\s*ml\s*(edp|edt|edc|parfum|cologne|fragrance|spray)?$/i, type: 'fragrance', description: 'Fragrance bottle size' },
    { pattern: /^eau\s*de\s*(parfum|toilette|cologne|vie)$/i, type: 'fragrance', description: 'Fragrance type (Eau de Parfum, Eau de Toilette)' },

    // ── Vintage / Antique dating ──────────────────────────────────────────────
    { pattern: /^circa\s*(1[6-9]\d{2}|20\d{2})$/i, type: 'vintage', description: 'Circa date (circa 1950, circa 1920)' },
    { pattern: /^(19|18|17)\d{2}s$/i, type: 'vintage', description: 'Decade (1920s, 1950s, 1970s)' },
    { pattern: /^(victorian|edwardian|georgian|regency|art\s*deco|art\s*nouveau|mid.century)\s*(era|period|style)?$/i, type: 'vintage', description: 'Era/period' },

    // ── Printer / Ink ─────────────────────────────────────────────────────────
    { pattern: /^page\s*yield\s*\d+$/i, type: 'printer', description: 'Page yield (Page yield 500, 2000)' },
    { pattern: /^\d+\s*(page|sheet)\s*(yield|capacity)$/i, type: 'printer', description: 'Page capacity' },
    { pattern: /^(xl|xxl|high\s*yield|extra\s*high\s*yield)\s*(cartridge|ink|toner)?$/i, type: 'printer', description: 'Cartridge yield type' },
    { pattern: /^(oem|compatible|remanufactured)\s*(cartridge|ink|toner)?$/i, type: 'printer', description: 'Cartridge type' },

    // ── Alcohol specs ─────────────────────────────────────────────────────────
    { pattern: /^\d+\s*year\s*old\s*(whisky|whiskey|rum|cognac|brandy)?$/i, type: 'alcohol', description: 'Age statement (10 year old, 18 year old)' },
    { pattern: /^aged\s*\d+\s*(years?|months?)$/i, type: 'alcohol', description: 'Aged duration (aged 12 years)' },
    { pattern: /^(cask\s*strength|barrel\s*strength|natural\s*cask)$/i, type: 'alcohol', description: 'Cask strength' },
    { pattern: /^(ex\s*bourbon|ex\s*sherry|ex\s*wine|ex\s*port|ex\s*rum)\s*(cask|barrel)?$/i, type: 'alcohol', description: 'Cask maturation type' },
    { pattern: /^\d+\s*cl\s*(bottle|spirit|wine)?$/i, type: 'alcohol', description: 'Bottle size in cl (70cl, 75cl)' },

    // ── Window film / Tint ────────────────────────────────────────────────────
    { pattern: /^\d+\s*%\s*(vlt|visible\s*light|transmission)$/i, type: 'window-tint', description: 'Visible light transmission (5% VLT, 35%)' },
    { pattern: /^\d+\s*%\s*(uv|ir|heat)\s*(rejection|block)$/i, type: 'window-tint', description: 'UV/IR rejection percentage' },
    { pattern: /^(ceramic|carbon|dyed|metallic)\s*(tint|window\s*film)?$/i, type: 'window-tint', description: 'Tint type (ceramic, carbon)' },

    // ── Pool / Spa ────────────────────────────────────────────────────────────
    { pattern: /^\d+\s*(person|man)\s*(hot\s*tub|spa|jacuzzi)?$/i, type: 'pool', description: 'Hot tub capacity (4 person, 6 person)' },
    { pattern: /^\d+\s*(litre|liter)\s*(pool|spa|tub)$/i, type: 'pool', description: 'Pool/tub volume' },
    { pattern: /^\d+g\s*(chlorine|bromine|shock)\s*(tablet|granule)?$/i, type: 'pool', description: 'Chemical tablet weight' },

    // ── Security camera ───────────────────────────────────────────────────────
    { pattern: /^\d+\s*(channel|ch)\s*(dvr|nvr|recorder)?$/i, type: 'camera', description: 'DVR/NVR channel count (4 channel, 8ch)' },
    { pattern: /^\d+\s*m\s*(night\s*vision|ir\s*range)$/i, type: 'camera', description: 'Night vision range (30m)' },
    { pattern: /^(poe|power\s*over\s*ethernet)\s*(\d+w)?$/i, type: 'camera', description: 'PoE power spec' },

    // ── Scale model ───────────────────────────────────────────────────────────
    { pattern: /^1[:\/]\d+\s*(scale)?$/i, type: 'model-scale', description: 'Model scale (1:72, 1:35, 1:18)' },

    // ── Epoxy / Resin ─────────────────────────────────────────────────────────
    { pattern: /^(uv|casting|coating|laminating|marine)\s*(resin|epoxy)$/i, type: 'resin', description: 'Resin type' },
    { pattern: /^(\d+)\s*min(ute)?\s*(pot\s*life|working\s*time)$/i, type: 'resin', description: 'Pot life in minutes' },
    { pattern: /^(\d+)\s*(hour|hr)\s*(cure|set|dry)\s*(time)?$/i, type: 'resin', description: 'Cure time' },

    // ── Hi-Fi audio ───────────────────────────────────────────────────────────
    { pattern: /^class\s*(a|ab|b|d|g|h)\s*(amplifier|amp)?$/i, type: 'hifi', description: 'Amplifier class' },
    { pattern: /^(tube|valve|solid\s*state|hybrid)\s*(amplifier|amp)?$/i, type: 'hifi', description: 'Amplifier type' },
    { pattern: /^\d+(\.\d+)?\s*(khz|bit)\s*(dac|audio)?$/i, type: 'hifi', description: 'DAC sample rate/bit depth' },
    { pattern: /^(mm|mc|moving\s*magnet|moving\s*coil)\s*(cartridge)?$/i, type: 'hifi', description: 'Phono cartridge type' },

    // ── Photography extras ────────────────────────────────────────────────────
    { pattern: /^(full\s*frame|aps.c|crop\s*sensor|micro\s*four\s*thirds|m43)\s*(sensor)?$/i, type: 'photo', description: 'Camera sensor size' },
    { pattern: /^(weather\s*sealed|dust\s*sealed|splash\s*proof|fully\s*weather\s*sealed)$/i, type: 'photo', description: 'Camera weather sealing' },
    { pattern: /^(ibis|ois|in\s*body|optical)\s*(stabilisation|stabilization)?$/i, type: 'photo', description: 'Image stabilisation type' },
    { pattern: /^\d+\s*axis\s*(stabilisation|ibis)?$/i, type: 'photo', description: '5 axis stabilisation' },

    // ── Outdoor power tool ────────────────────────────────────────────────────
    { pattern: /^(brushless|brushed)\s*(motor|drill|saw|sander)?$/i, type: 'tool', description: 'Motor type (brushless, brushed)' },

    // ── Flooring specs ────────────────────────────────────────────────────────
    { pattern: /^ac\s*[1-6]\s*(rated|rating|class)?$/i, type: 'flooring', description: 'Floor wear rating AC1-AC6' },
    { pattern: /^(\d+(\.\d+)?)\s*mm\s*(wear\s*layer|surface\s*layer)?$/i, type: 'flooring', description: 'Wear layer thickness (0.3mm, 0.5mm, 1mm)' },
    { pattern: /^(click|click\s*lock|tongue\s*&?\s*groove|glue\s*down|loose\s*lay|floating)\s*(floor|install)?$/i, type: 'flooring', description: 'Floor fitting method' },
    { pattern: /^\d+(\.\d+)?\s*mm\s*(thick|thickness)\s*(floor|plank|board|panel)?$/i, type: 'flooring', description: 'Flooring thickness (8mm, 12mm thick)' },
    { pattern: /^(\d+)\s*mm\s*x\s*(\d+)\s*mm\s*(plank|tile|board)?$/i, type: 'flooring', description: 'Plank/tile dimensions' },
    { pattern: /^class\s*(21|22|23|31|32|33|34)\s*(use|rating)?$/i, type: 'flooring', description: 'Laminate use class (Class 32, Class 33)' },

    // ── Trading card specs ────────────────────────────────────────────────────
    { pattern: /^psa\s*\d+(\.\d+)?$/i, type: 'card-grade', description: 'PSA grade (PSA 9, PSA 10)' },
    { pattern: /^bgs\s*\d+(\.\d+)?$/i, type: 'card-grade', description: 'BGS grade (BGS 9, BGS 9.5)' },
    { pattern: /^cgc\s*\d+(\.\d+)?$/i, type: 'card-grade', description: 'CGC grade (CGC 9, CGC 10)' },
    { pattern: /^(gem\s*mint|mint|near\s*mint|lightly\s*played|moderately\s*played|heavily\s*played|damaged)\s*(condition)?$/i, type: 'condition', description: 'Card condition grade' },
    { pattern: /^(1st\s*edition|shadowless|unlimited|1st\s*print|first\s*edition)\s*(print|edition)?$/i, type: 'card-edition', description: 'Card print edition' },
    { pattern: /^(holo|reverse\s*holo|foil|holographic|full\s*art|secret\s*rare|ultra\s*rare|hyper\s*rare)\s*(card|variant)?$/i, type: 'card-variant', description: 'Card variant type' },

    // ── Board sports specs ────────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*"\s*(deck|skateboard|snowboard|surfboard)?$/i, type: 'board-sport', description: 'Board width in inches (8.0" deck)' },
    { pattern: /^\d+(\.\d+)?\s*cm\s*(deck|board|ski|snowboard)?$/i, type: 'board-sport', description: 'Board length in cm' },
    { pattern: /^abec\s*\d+(\s*bearing)?$/i, type: 'skateboard', description: 'Bearing rating (ABEC 5, ABEC 7, ABEC 9)' },
    { pattern: /^\d+a\s*(durometer|shore|wheel)?$/i, type: 'skateboard', description: 'Wheel hardness (99A, 101A, 78A)' },
    { pattern: /^\d+(\.\d+)?\s*mm\s*(wheel|truck|axle)?$/i, type: 'skateboard', description: 'Wheel/truck size in mm (52mm, 54mm)' },
    { pattern: /^(stiff|medium|soft|flex\s*[1-5]|flex\s*(1|2|3|4|5))\s*(flex|board|ski)?$/i, type: 'board-sport', description: 'Board/ski flex rating' },

    // ── Equestrian specs ──────────────────────────────────────────────────────
    { pattern: /^(\d+(\.\d+)?)\s*(hand|hh)\s*(horse|pony)?$/i, type: 'equestrian', description: 'Horse height in hands (14.2hh, 16hh)' },
    { pattern: /^(pony|cob|full|extra\s*full|small\s*pony)\s*(size|fit)?$/i, type: 'equestrian', description: 'Equestrian size (pony, cob, full)' },
    { pattern: /^(\d+)\s*g\s*(fill|turnout|stable|medium\s*weight)?$/i, type: 'equestrian', description: 'Rug fill weight (100g, 200g, 300g fill)' },
    { pattern: /^(5|5\.5|6|6\.5|7|7\.5|8|8\.5|9|9\.5|10)\s*(inch|")\s*(girth|saddle|bit)?$/i, type: 'equestrian', description: 'Equestrian sizing' },
    { pattern: /^(\d+\.?\d*)\s*(snaffle|pelham|kimblewick|weymouth|gag)\s*(bit)?$/i, type: 'equestrian', description: 'Bit type and size' },

    // ── Coin & Bullion specs ──────────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*troy\s*(oz|ounce)$/i, type: 'bullion', description: 'Troy ounce weight (1 troy oz, 0.5 troy oz)' },
    { pattern: /^\d+(\.\d+)?\s*fine\s*(gold|silver|platinum|palladium)$/i, type: 'bullion', description: 'Fine metal (1oz fine gold)' },
    { pattern: /^\.999\s*(fine|silver|gold)?$/i, type: 'bullion', description: 'Metal purity (.999 fine silver)' },
    { pattern: /^\.9999\s*(fine|gold|silver)?$/i, type: 'bullion', description: 'Metal purity (.9999 fine gold)' },
    { pattern: /^\.9167\s*(gold)?$/i, type: 'bullion', description: '22ct gold purity (.9167)' },
    { pattern: /^(proof|bu|brilliant\s*uncirculated|uncirculated|circulated|bullion)\s*(coin|finish)?$/i, type: 'coin', description: 'Coin condition/type' },
    { pattern: /^(\d{4})\s*(year\s*)?(coin|proof|bu|mint|issue)?$/i, type: 'coin', description: 'Coin year of issue' },

    // ── Pet food/treatment specs ──────────────────────────────────────────────
    { pattern: /^(grain\s*free|gluten\s*free|hypoallergenic|limited\s*ingredient|raw|barf)\s*(pet\s*food|dog\s*food|cat\s*food)?$/i, type: 'pet-food', description: 'Pet food type' },
    { pattern: /^(puppy|junior|adult|senior|mature|kitten|all\s*life\s*stage)\s*(formula|recipe|food)?$/i, type: 'pet-food', description: 'Pet age stage food' },
    { pattern: /^(small|medium|large|giant|toy)\s*(breed)\s*(food|formula|recipe)?$/i, type: 'pet-food', description: 'Breed size food' },
    { pattern: /^\d+(\.\d+)?\s*%\s*(protein|fat|fibre|moisture|ash)\s*(pet|min|max)?$/i, type: 'pet-food', description: 'Pet food nutrient percentage' },
    { pattern: /^(spot\s*on|topical|oral|injection|collar|tablet|chewable)\s*(treatment|flea|tick|worm)?$/i, type: 'pet-treatment', description: 'Parasite treatment type' },
    { pattern: /^(small|medium|large)\s*(dog|cat|rabbit|ferret)\s*(treatment|dose)?$/i, type: 'pet-treatment', description: 'Treatment size/dose' },
    { pattern: /^(\d+(\.\d+)?)\s*(kg|lbs?)\s*(dog|cat|pet)\s*(dose|weight|treatment)?$/i, type: 'pet-treatment', description: 'Treatment weight range' },

    // ── Garden extras ─────────────────────────────────────────────────────────
    { pattern: /^(\d+)\s*(litre|liter|l)\s*(bag|sack|tub)?\s*(compost|topsoil|bark|gravel|mulch)?$/i, type: 'garden', description: 'Garden product volume (60L compost, 10L bark)' },
    { pattern: /^(\d+)\s*(kg|g)\s*(seed|grass\s*seed|wildflower|fertiliser|weedkiller|pesticide)?$/i, type: 'garden', description: 'Garden product weight' },
    { pattern: /^(\d+)\s*m²\s*(coverage|covers?|lawn|garden)?$/i, type: 'garden', description: 'Coverage area in m² (100m² coverage)' },
    { pattern: /^(npk|n-p-k)\s*\d+[-–:]\d+[-–:]\d+$/i, type: 'garden', description: 'NPK fertiliser ratio (NPK 7-7-7)' },
    { pattern: /^(ready\s*to\s*use|concentrate|dilute|neat|rtu)\s*(spray|formula)?$/i, type: 'garden', description: 'Product form (ready to use, concentrate)' },
    { pattern: /^(systemic|contact|selective|non\s*selective|residual)\s*(herbicide|weedkiller|insecticide)?$/i, type: 'garden', description: 'Pesticide/herbicide type' },

    // ── Art & Craft specs ─────────────────────────────────────────────────────
    { pattern: /^(student|professional|artist|studio)\s*(grade|quality|range)?$/i, type: 'art', description: 'Art quality grade (student, professional)' },
    { pattern: /^series\s*[1-7]\s*(colour|color|paint)?$/i, type: 'art', description: 'Paint series/price group (Series 1, Series 3)' },
    { pattern: /^(\d+)\s*ml\s*(tube|pot|bottle|jar)\s*(paint|ink|medium)?$/i, type: 'art', description: 'Paint tube/pot size (21ml, 37ml, 150ml)' },
    { pattern: /^(\d+)\s*ml\s*(spray|can|aerosol)\s*(paint)?$/i, type: 'art', description: 'Spray paint can size' },
    { pattern: /^(cold\s*press|hot\s*press|rough|smooth)\s*(watercolour|paper)?$/i, type: 'art', description: 'Paper texture (cold press, hot press, rough)' },
    { pattern: /^(single\s*pigment|lightfast|fugitive|archival|permanent)\s*(colour|ink|paint)?$/i, type: 'art', description: 'Paint lightfastness (lightfast, archival, permanent)' },
    { pattern: /^astm\s*(i{1,3}|1|2|3)$/i, type: 'art', description: 'ASTM lightfastness rating (ASTM I, ASTM II)' },
    { pattern: /^(hb|2h|4h|6h|8h|2b|4b|6b|8b|10b|eb|b|f|h)\s*(pencil|grade)?$/i, type: 'art', description: 'Pencil hardness grade (HB, 2B, 6B)' },

    // ── Watch extras ──────────────────────────────────────────────────────────
    { pattern: /^(\d+(\.\d+)?)\s*mm\s*(lug|strap\s*width|band\s*width|case)?$/i, type: 'watch', description: 'Watch lug/strap width (20mm lug, 22mm strap)' },
    { pattern: /^(\d+)\s*(jewel|jewels|jewelled)\s*(movement)?$/i, type: 'watch', description: 'Movement jewel count (17 jewels, 21 jewels)' },
    { pattern: /^(\d+)\s*(beat|bph|vph)\s*(per\s*(hour|second))?$/i, type: 'watch', description: 'Movement frequency (28800 bph, 21600 vph)' },
    { pattern: /^(unidirectional|bidirectional|fixed|fluted|coin\s*edge)\s*(bezel)?$/i, type: 'watch', description: 'Watch bezel type' },
    { pattern: /^(rubber|silicone|leather|nylon|nato|jubilee|oyster|bracelet|mesh|milanese)\s*(strap|band|bracelet)?$/i, type: 'watch', description: 'Watch strap material/type' },
    { pattern: /^(black|white|blue|green|grey|silver|gold|rose\s*gold)\s*(dial)$/i, type: 'watch', description: 'Watch dial colour' },
    { pattern: /^(exhibition|display|skeleton|solid\s*case)\s*(caseback|back)$/i, type: 'watch', description: 'Watch caseback type' },

    // ── 3D Printing extras ────────────────────────────────────────────────────
    { pattern: /^(pla|abs|petg|tpu|asa|pc|nylon|pa12|pa6|pva|hips|carbon\s*fibre|cf)\s*(filament|3d|print)?$/i, type: '3d-print', description: '3D printing filament material' },
    { pattern: /^(fdm|sla|msla|dlp|sls|sla|resin)\s*(printer|print)?$/i, type: '3d-print', description: '3D printer type (FDM, SLA, Resin)' },
    { pattern: /^(\d+)\s*(micron|um|µm)\s*(layer|resolution|accuracy)?$/i, type: '3d-print', description: 'Print resolution in microns (50 micron, 25µm)' },
    { pattern: /^(\d+)\s*x\s*(\d+)\s*x\s*(\d+)\s*(mm|cm)?\s*(build\s*(volume|plate))?$/i, type: '3d-print', description: 'Build volume (220x220x250mm)' },

    // ── Pressure washer extras ────────────────────────────────────────────────
    { pattern: /^\d+\s*(psi|bar)\s*(max|pressure|rated|working)?$/i, type: 'pressure', description: 'Max pressure (3000 PSI, 130 bar)' },
    { pattern: /^\d+(\.\d+)?\s*(gpm|lpm|l\/min)\s*(flow)?$/i, type: 'flow', description: 'Water flow rate (8 LPM, 2 GPM)' },

    // ── Electric vehicle/mobility ─────────────────────────────────────────────
    { pattern: /^\d+(\.\d+)?\s*(mile|km|km\/h|mph)\s*(range|speed|max\s*speed)?$/i, type: 'ev', description: 'EV/scooter range or speed' },
    { pattern: /^\d+(\.\d+)?\s*v\s*(battery|electric|ebike|scooter)?$/i, type: 'ev', description: 'Electric vehicle battery voltage' },
    { pattern: /^\d+(\.\d+)?\s*ah\s*(battery|capacity)?$/i, type: 'ev', description: 'Electric vehicle battery capacity' },
    { pattern: /^\d+(\.\d+)?\s*w\s*(motor|hub\s*motor|mid\s*drive)?$/i, type: 'ev', description: 'Electric motor wattage' },
    { pattern: /^(pedal\s*assist|throttle|pedelec|class\s*[123])\s*(ebike)?$/i, type: 'ev', description: 'E-bike assist type' },

    // ── Knife/Blade specs ─────────────────────────────────────────────────────
    { pattern: /^(\d+(\.\d+)?)\s*(cm|mm|inch|")\s*(blade|cutting\s*edge)?$/i, type: 'blade', description: 'Blade length (20cm blade, 8 inch)' },
    { pattern: /^(vg-?10|vg-?1|aus-?8|aus-?10|d2|s30v|s35vn|m390|elmax|cpm\s*154|154cm|n690|k110|8cr13mov|420hc)\s*(steel)?$/i, type: 'blade', description: 'Blade steel grade (VG10, AUS8, D2, S30V)' },
    { pattern: /^(full\s*tang|partial\s*tang|rat\s*tail|hidden\s*tang|push\s*tang)\s*(construction)?$/i, type: 'blade', description: 'Tang type (full tang, partial tang)' },
    { pattern: /^(hollow|flat|convex|compound|chisel|scandi|v\s*grind|hamaguri)\s*(grind|edge)?$/i, type: 'blade', description: 'Blade grind type (hollow, flat, scandi)' },
    { pattern: /^(\d+)°\s*(bevel|edge\s*angle|grind\s*angle)?$/i, type: 'blade', description: 'Edge angle in degrees (15°, 20° bevel)' },
    { pattern: /^(hrc|rockwell)\s*\d+[-–]?\d*$/i, type: 'blade', description: 'Hardness (HRC 58-60, Rockwell 62)' },

]

// ── Fixed spec words — exact matches ─────────────────────────────────────────
// Words that are ALWAYS specs regardless of context.
// These are technical standards, certifications, and ratings.
export const FIXED_SPEC_WORDS = new Set([

    // ── Connectivity standards ────────────────────────────────────────────────
    'usb-c', 'usb-a', 'usb-b', 'type-c', 'type-a', 'micro-usb', 'mini-usb',
    'lightning', 'thunderbolt', 'displayport', 'vga', 'dvi', 'hdmi', 'aux',
    'rj45', 'rj11', 'ethernet', 'optical', 'coaxial', 'xlr', 'jack',
    '3.5mm', '6.35mm', '2.5mm', 'bnc', 'rca',
    'bluetooth', 'wifi', 'wi-fi', 'nfc', 'rfid', 'zigbee', 'zwave', 'lora',
    '4g', '5g', 'lte', '3g', '2g', 'gsm', 'cdma',
    'ipv4', 'ipv6', 'tcp', 'ip', 'dns', 'dhcp',

    // ── Protection & Certification ratings ───────────────────────────────────
    'ip44', 'ip54', 'ip55', 'ip65', 'ip66', 'ip67', 'ip68', 'ip69',
    'ipx4', 'ipx5', 'ipx6', 'ipx7', 'ipx8',
    'atex', 'iec', 'ce', 'fcc', 'rohs', 'reach', 'ul', 'etl', 'csa', 'bsmi',
    'mil-spec', 'mil-std', 'milspec', 'military grade', 'military-grade',
    'ansi', 'iso', 'en', 'din', 'bs', 'astm', 'nema',

    // ── Screen & Display ──────────────────────────────────────────────────────
    'amoled', 'oled', 'qled', 'lcd', 'ips', 'tn', 'va', 'mini-led', 'micro-led',
    'hdr', 'hdr10', 'dolby vision', '4k', '8k', '2k', '1080p', '720p', '480p',
    'fullhd', 'full hd', 'qhd', 'uhd', 'fhd', 'wqhd', 'wxga', 'xga', 'svga',
    'retina', 'super retina', '120hz', '144hz', '165hz', '240hz', '60hz',

    // ── Audio formats & standards ─────────────────────────────────────────────
    'dolby atmos', 'dolby digital', 'dts', 'dts-x', 'thx', 'hi-res', 'hi-res audio',
    'aptx', 'aptx hd', 'aptx adaptive', 'ldac', 'aac', 'sbc', 'mp3', 'flac', 'wav', 'aiff',
    'stereo', 'mono', '7.1', '5.1', '2.1', 'surround',

    // ── Processor & Performance ───────────────────────────────────────────────
    'snapdragon', 'helio', 'dimensity', 'apple silicon', 'm1', 'm2', 'm3',
    'intel', 'amd', 'ryzen', 'core i3', 'core i5', 'core i7', 'core i9',
    'arm', 'cortex', 'octa-core', 'quad-core', 'dual-core', 'hexa-core',
    'ddr3', 'ddr4', 'ddr5', 'lpddr4', 'lpddr5',
    'nvidia', 'geforce', 'rtx', 'gtx', 'radeon', 'rx',
    'ssd', 'nvme', 'pcie', 'm.2', 'sata', 'hdd',

    // ── Battery & Power ───────────────────────────────────────────────────────
    'pd', 'pd charging', 'pd3.0', 'qc', 'qc3.0', 'qc4.0', 'quick charge',
    'fast charge', 'super fast', 'vooc', 'dash charge', 'warp charge',
    'magsafe', 'qi', 'wireless charging', '15w', '20w', '25w', '30w', '45w',
    '65w', '90w', '100w', '120w', '140w', '200w', '240w',
    '18650', '21700', 'lithium', 'li-ion', 'lifepo4', 'nimh', 'nicd',

    // ── Camera ───────────────────────────────────────────────────────────────
    'f/1.8', 'f/2.0', 'f/2.4', 'f/2.8', 'ois', 'ibis', 'autofocus', 'af',
    'ultra wide', 'telephoto', 'periscope', 'macro',
    'raw', 'jpeg', 'heif', 'hevc', 'h.264', 'h.265', '4k video', '8k video',

    // ── Material standards ────────────────────────────────────────────────────
    '304 stainless', '316 stainless', 'food grade', 'bpa free', 'bpa-free',
    'food safe', 'fda approved', 'non-toxic', 'phthalate free',
    'tempered glass', 'gorilla glass', 'sapphire', 'ceramic',
    '925 silver', 'sterling silver', '18k gold', '14k gold', '9ct gold', '18ct gold',
    '925 sterling', 'solid gold', 'gold plated', 'silver plated', 'rose gold plated',
    '100% cotton', '100% polyester', '100% wool', '100% leather', 'genuine leather',
    'full grain', 'top grain', 'suede', 'nubuck', 'patent leather',

    // ── Size codes ────────────────────────────────────────────────────────────
    'xs', 'xxs', 'xxxs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', '2xl', '3xl', '4xl', '5xl', '6xl',
    'one size', 'one-size', 'os', 'free size', 'fits all',
    'petite', 'regular', 'tall', 'plus', 'curve',
    'narrow', 'wide', 'extra wide', '2e', '4e',

    // ── Energy ratings ────────────────────────────────────────────────────────
    'a+++', 'a++', 'a+', 'a rated', 'b rated', 'energy star', 'eco',
    'erp', 'eup', 'energy efficient',

    // ── Medical & Safety ratings ──────────────────────────────────────────────
    'ce marked', 'class ii', 'class iii', 'medical grade', 'sterile', 'latex free',
    'hypoallergenic', 'dermatologist tested', 'clinically tested', 'spf 30', 'spf 50',
    'spf50+', 'spf30+', 'uva', 'uvb', 'uv400', 'broad spectrum',

    // ── Vehicle specific ──────────────────────────────────────────────────────
    'obd2', 'obd-ii', 'can bus', 'j1850', 'iso 9141', 'k-line',
    'oe', 'oem', 'genuine', 'original equipment', 'aftermarket',
    '12v', '24v', '48v', 'dc', 'ac',

    // ── Rope / Wire standards ─────────────────────────────────────────────────
    '550 paracord', 'dyneema', 'kevlar', 'spectra',
    'awg', 'swg', 'mm2',

    // ── Time & Warranty ───────────────────────────────────────────────────────
    '1 year warranty', '2 year warranty', '3 year warranty', 'lifetime warranty',
    '12 month warranty', '24 month warranty',

    // ── Regional plug types ───────────────────────────────────────────────────
    'uk plug', 'us plug', 'eu plug', 'au plug', 'type a', 'type b', 'type c plug',
    'type e', 'type f', 'type g', 'type i', 'schuko',
    '110v', '120v', '220v', '230v', '240v',
    '50hz', '60hz',

    // ── Connectivity version numbers ──────────────────────────────────────────
    'bluetooth 4.0', 'bluetooth 4.1', 'bluetooth 4.2',
    'bluetooth 5.0', 'bluetooth 5.1', 'bluetooth 5.2', 'bluetooth 5.3',
    'usb 2.0', 'usb 3.0', 'usb 3.1', 'usb 3.2', 'usb 4.0',
    'hdmi 1.4', 'hdmi 2.0', 'hdmi 2.1',
    'wifi 5', 'wifi 6', 'wifi 6e', 'wifi 7',
    '802.11ac', '802.11ax', '802.11n',
    'thunderbolt 3', 'thunderbolt 4',


    // ── Wire / Cable specs ────────────────────────────────────────────────────
    '1 core', '2 core', '3 core', '4 core', '5 core', '6 core', '7 core',
    '1.5mm2', '2.5mm2', '4mm2', '6mm2', '10mm2', '16mm2',
    'cat5', 'cat5e', 'cat6', 'cat6a', 'cat7', 'cat8',
    'rg58', 'rg59', 'rg6', 'rg11',
    'swa', 'armoured', 'unarmoured', 'screened',

    // ── Medical / Health ─────────────────────────────────────────────────────
    'class i', 'class ii', 'class iii', 'class iv',
    'type 1', 'type 2', 'type 3',
    'grade a', 'grade b', 'grade c', 'grade d', 'grade i', 'grade ii',
    'sterile', 'non-sterile', 'single use', 'reusable',
    'latex free', 'latex-free', 'nitrile', 'vinyl',
    'small medium large', 'one size fits all',

    // ── Food / Supplement ────────────────────────────────────────────────────
    'vegan', 'vegetarian', 'gluten free', 'gluten-free', 'dairy free', 'dairy-free',
    'nut free', 'nut-free', 'sugar free', 'sugar-free', 'salt free', 'salt-free',
    'organic', 'non-gmo', 'gmo free', 'fairtrade', 'fair trade',
    'kosher', 'halal', 'keto', 'paleo', 'low carb', 'low-carb',
    'whey protein', 'plant protein', 'collagen', 'creatine', 'bcaa', 'omega 3',
    'vitamin c', 'vitamin d', 'vitamin d3', 'vitamin b12', 'vitamin k2',
    'zinc', 'magnesium', 'calcium', 'iron', 'potassium', 'selenium',

    // ── Automotive ───────────────────────────────────────────────────────────
    'euro 5', 'euro 6', 'bs6', 'bs4',
    '5w30', '5w40', '10w40', '0w20', '15w40',
    'dot 3', 'dot 4', 'dot 5', 'dot 5.1',
    'sae 30', 'sae 40',
    'gl-4', 'gl-5',
    'r134a', 'r1234yf',
    'e10', 'e5', 'b7',

    // ── Drill bits / Fixings ─────────────────────────────────────────────────
    'm3', 'm4', 'm5', 'm6', 'm8', 'm10', 'm12', 'm16', 'm20',
    'm3x10', 'm4x16', 'm5x20', 'm6x25', 'm8x30',
    '1/4 bsp', '3/8 bsp', '1/2 bsp', '3/4 bsp', '1 bsp',
    '1/4 npt', '3/8 npt', '1/2 npt',
    'pozidrive', 'phillips', 'torx', 'hex', 'slotted',
    'pz1', 'pz2', 'pz3', 'ph1', 'ph2', 'ph3',
    't10', 't15', 't20', 't25', 't27', 't30', 't40',
    'tx10', 'tx15', 'tx20', 'tx25', 'tx30',

    // ── Paper / Print ─────────────────────────────────────────────────────────
    'a3', 'a4', 'a5', 'a6', 'a7', 'letter', 'legal', 'tabloid',
    '80gsm', '90gsm', '100gsm', '120gsm', '160gsm', '200gsm', '250gsm', '300gsm',
    '75gsm', '170gsm', '280gsm',

    // ── Screen sizes (TV / Monitor) ────────────────────────────────────────────
    '24 inch', '27 inch', '32 inch', '40 inch', '43 inch', '50 inch',
    '55 inch', '65 inch', '75 inch', '85 inch',
    '24"', '27"', '32"', '40"', '43"', '50"', '55"', '65"', '75"', '85"',

    // ── RAM / Processor speed ─────────────────────────────────────────────────
    '4gb ram', '8gb ram', '16gb ram', '32gb ram', '64gb ram',
    '4gb', '8gb', '16gb', '32gb', '64gb', '128gb', '256gb', '512gb',
    '1tb', '2tb', '4tb', '8tb',
    '2.4ghz', '3.0ghz', '3.5ghz', '4.0ghz', '4.5ghz', '5.0ghz',
    'dual band', 'tri band', 'quad band',

    // ── Toy ratings ───────────────────────────────────────────────────────────
    'age 3+', 'age 4+', 'age 5+', 'age 6+', 'age 7+', 'age 8+', 'age 10+', 'age 12+', 'age 14+', 'age 16+', 'age 18+',
    '3 years+', '4 years+', '5 years+', '6 years+',
    'for ages 3', 'for ages 4', 'for ages 5', 'for ages 6',

    // ── Watch / Jewellery ─────────────────────────────────────────────────────
    '38mm', '40mm', '41mm', '42mm', '44mm', '45mm', '49mm',
    'case size 38', 'case size 40', 'case size 44',
    '316l stainless', '316 stainless',
    '9ct', '14ct', '18ct', '24ct', '9k', '14k', '18k', '24k',
    '0.25ct', '0.5ct', '1ct', '2ct',
    'f vs1', 'g vs2', 'h si1',

    // ── Cycling ───────────────────────────────────────────────────────────────
    '700c', '26 inch', '27.5 inch', '29 inch', '20 inch',
    '1x', '2x', '3x', '11 speed', '12 speed', '10 speed', '9 speed',
    'shimano', 'sram', 'campagnolo',

    // ── Tennis / Racket sports ────────────────────────────────────────────────
    'grip size 1', 'grip size 2', 'grip size 3', 'grip size 4', 'grip size 5',
    'l1', 'l2', 'l3', 'l4', 'l5',
    '4 1/8', '4 1/4', '4 3/8', '4 1/2',

    // ── Guitar / Music ────────────────────────────────────────────────────────
    '6 string', '7 string', '12 string',
    'standard tuning', 'drop d', 'open g',
    '4 string', '5 string', '6 string bass',

    // ── Additional UK/US specifics ────────────────────────────────────────────
    'uk seller', 'us seller', 'au seller',
    'uk stock', 'us stock', 'au stock',
    'uk spec', 'us spec',
    'left hand drive', 'right hand drive', 'lhd', 'rhd',


    // ── Version / Edition ────────────────────────────────────────────────────
    'pro', 'max', 'ultra', 'plus', 'lite', 'mini', 'se', 'air', 'neo', 'fe', 'note',
    'limited edition', 'limited-edition', 'special edition', 'special-edition',
    'collectors edition', 'anniversary edition', 'deluxe edition',
    'gen 1', 'gen 2', 'gen 3', 'gen 4', 'gen 5',
    '1st gen', '2nd gen', '3rd gen', '4th gen', '5th gen',
    'series 1', 'series 2', 'series 3', 'series 4', 'series 5',
    'series 6', 'series 7', 'series 8', 'series 9', 'series 10',
    'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8',
    'v1', 'v2', 'v3', 'v4', 'v5',
    '1st edition', '2nd edition', '3rd edition',

    // ── Clothing fit ─────────────────────────────────────────────────────────
    'slim fit', 'regular fit', 'relaxed fit', 'skinny fit', 'straight fit',
    'tapered fit', 'athletic fit', 'loose fit', 'fitted', 'oversized fit',
    'classic fit', 'modern fit', 'comfort fit', 'standard fit',

    // ── Shoe width ────────────────────────────────────────────────────────────
    '2e width', '4e width', 'ee width', 'eee width', 'd width', 'b width',
    'wide fit', 'narrow fit', 'extra wide fit', 'standard fit', 'medium width',

    // ── Game / Media region ──────────────────────────────────────────────────
    'pal', 'ntsc', 'ntsc-j', 'ntsc-u', 'region 1', 'region 2', 'region 3',
    'region 4', 'region 5', 'region 6', 'region free', 'all regions',
    'blu-ray', 'blu ray', '4k blu-ray', '4k blu ray', 'dvd', 'vhs', 'betamax',
    'hd dvd', 'uhd blu-ray',

    // ── Photography ───────────────────────────────────────────────────────────
    'nd2', 'nd4', 'nd8', 'nd16', 'nd32', 'nd64', 'nd1000',
    'cpl', 'circular polariser', 'circular polarizer', 'uv filter',
    '37mm filter', '40.5mm filter', '43mm filter', '46mm filter', '49mm filter',
    '52mm filter', '55mm filter', '58mm filter', '62mm filter', '67mm filter',
    '72mm filter', '77mm filter', '82mm filter', '86mm filter', '95mm filter',
    'iso 100', 'iso 200', 'iso 400', 'iso 800', 'iso 1600', 'iso 3200', 'iso 6400',

    // ── Tech specs ───────────────────────────────────────────────────────────
    'nvme', 'm.2', 'm2 nvme', 'pcie 3.0', 'pcie 4.0', 'pcie 5.0',
    'sata i', 'sata ii', 'sata iii', 'sata 3', 'sata 6gb',
    'ddr3', 'ddr4', 'ddr5', 'ddr4-3200', 'ddr4-3600', 'ddr5-6000',
    'lpddr4', 'lpddr4x', 'lpddr5',
    'so-dimm', 'dimm', 'ecc', 'non-ecc', 'registered', 'unbuffered',
    '2.5 inch drive', '3.5 inch drive', '2.5" drive', '3.5" drive',
    'micro atx', 'mini itx', 'atx', 'e-atx',
    'rj45', 'sfp', 'sfp+', 'qsfp',

    // ── Electrical ───────────────────────────────────────────────────────────
    '1 gang', '2 gang', '3 gang', '4 gang',
    '1 way', '2 way', '3 way', '4 way',
    '13 amp', '16 amp', '20 amp', '32 amp', '63 amp',
    'ip20', 'ip44', 'ip54', 'ip55', 'ip65', 'ip66', 'ip67', 'ip68',
    'class i', 'class ii', 'class iii',
    'rcbo', 'rcd', 'mcb', 'fuse', 'consumer unit',
    'single phase', 'three phase', '3 phase',

    // ── Tyre ─────────────────────────────────────────────────────────────────
    'run flat', 'run-flat', 'self sealing', 'self-sealing',
    'winter tyre', 'summer tyre', 'all season tyre', 'all-season',
    'c rated', 'xl rated', 'reinforced',

    // ── Optical ──────────────────────────────────────────────────────────────
    'uv400', 'polarised', 'polarized', 'photochromic', 'transition',
    'anti-glare', 'anti-reflective', 'anti-scratch', 'blue light',
    '+1.0', '+1.5', '+2.0', '+2.5', '+3.0', '+3.5', '+4.0',
    '-1.0', '-1.5', '-2.0', '-2.5', '-3.0', '-3.5', '-4.0',

    // ── Fishing ──────────────────────────────────────────────────────────────
    'monofilament', 'fluorocarbon', 'braided line', 'braid',
    'monofilament line', 'mono line',
    '2/0 hook', '3/0 hook', '4/0 hook', '5/0 hook', '6/0 hook',
    'size 4 hook', 'size 6 hook', 'size 8 hook', 'size 10 hook',
    '10lb test', '20lb test', '30lb test', '50lb test',

    // ── Paint / Finish ────────────────────────────────────────────────────────
    'matt finish', 'matte finish', 'gloss finish', 'satin finish',
    'silk finish', 'eggshell finish', 'flat finish', 'semi-gloss',
    'high gloss', 'full gloss', 'low sheen',

    // ── Colour temperature ────────────────────────────────────────────────────
    'warm white', 'cool white', 'natural white', 'daylight white',
    'neutral white', 'extra warm white',
    '2700k', '3000k', '3500k', '4000k', '4500k', '5000k', '5500k', '6000k', '6500k',
    'cri 80', 'cri 90', 'cri 95', 'cri 97', 'cri 98',

    // ── Connectivity extras ───────────────────────────────────────────────────
    'cat 5', 'cat 5e', 'cat 6', 'cat 6a', 'cat 7', 'cat 8',
    'rg6', 'rg11', 'rg58', 'rg59',
    '1000base-t', '100base-t', '10gbase-t',
    'poe', 'poe+', 'poe++',
    'mu-mimo', 'ofdma', 'beamforming',

    // ── Camping / Outdoor ─────────────────────────────────────────────────────
    '2 season', '3 season', '4 season',
    '2 man tent', '3 man tent', '4 man tent', '6 man tent',
    '2 person', '3 person', '4 person', '6 person',
    '-5°c', '-10°c', '-15°c', '-20°c', '-30°c',
    '0°c', '5°c', '10°c',
    '1000mm', '1500mm', '2000mm', '3000mm', '5000mm', '10000mm',
    'comfort rating', 'lower limit',


    // ── Frequency ─────────────────────────────────────────────────────────────
    '433mhz', '868mhz', '915mhz', '2.4ghz', '5ghz', '5.8ghz', '6ghz',
    '2400mhz', '5000mhz', '6000mhz',
    'am', 'fm', 'dab', 'dab+', 'sw', 'cb radio', 'pmr446',
    'vhf', 'uhf', 'am/fm', 'fm radio',

    // ── Force / Energy ────────────────────────────────────────────────────────
    '10kn', '12kn', '20kn', '25kn', '30kn', '40kn', '50kn',
    '100kwh', '200kwh', '300kwh',
    '100wp', '200wp', '300wp', '400wp', '500wp',
    'mppt', 'pwm',

    // ── Solar ────────────────────────────────────────────────────────────────
    'monocrystalline', 'polycrystalline', 'bifacial',
    '12v system', '24v system', '48v system',

    // ── Magnification ─────────────────────────────────────────────────────────
    '8x42', '10x42', '10x50', '12x50', '8x21', '8x30', '10x25',
    '3-9x40', '4-12x50', '4-16x50', '6-24x50',
    '40x', '100x', '400x', '1000x',
    'wf10x', 'wf15x', 'wf20x',
    '10x zoom', '20x zoom', '30x zoom', '40x zoom',
    'first focal plane', 'second focal plane', 'ffp', 'sfp',
    'moa', 'mrad', '1/4 moa', '0.1 mrad',

    // ── 3D Printing ───────────────────────────────────────────────────────────
    'pla', 'abs', 'petg', 'tpu', 'tpe', 'asa', 'pc', 'nylon', 'pa12', 'pa6',
    'pla+', 'pla pro', 'silk pla', 'wood pla', 'metal pla',
    'resin', 'standard resin', 'abs-like resin', 'water washable resin',
    'fdm', 'fff', 'sla', 'dlp', 'msla', 'sls',
    '1.75mm filament', '2.85mm filament',
    '0.4mm nozzle', '0.2mm nozzle', '0.6mm nozzle', '0.8mm nozzle',
    'hardened steel nozzle', 'brass nozzle', 'ruby nozzle',
    'build plate', 'heated bed', 'print bed',

    // ── Welding ───────────────────────────────────────────────────────────────
    'mig', 'tig', 'mma', 'fcaw', 'smaw', 'gmaw', 'gtaw',
    'flux core', 'solid wire', 'stick electrode',
    'e6013', 'e7018', 'e6011', 'e7016', 'e308l', 'e309l',
    'er70s-6', 'er308l', 'er309l', 'er316l', 'er4043', 'er5356',
    'c25', 'c100', 'ar/co2', 'argon', 'co2 gas',
    'gas lens', 'collet body', 'tungsten electrode',
    '0.6mm wire', '0.8mm wire', '0.9mm wire', '1.0mm wire', '1.2mm wire',

    // ── Plumbing ─────────────────────────────────────────────────────────────
    'compression fitting', 'push fit', 'push-fit', 'solder ring',
    'wras approved', 'wras', 'dzr brass', 'dezincification resistant',
    '15mm compression', '22mm compression', '28mm compression',
    'bsp male', 'bsp female', '1/2 bsp', '3/4 bsp', '1 inch bsp',
    'isolation valve', 'gate valve', 'ball valve', 'check valve',
    'ptfe tape', 'jointing compound', 'flux paste',

    // ── Climbing / Safety ────────────────────────────────────────────────────
    'kernmantle', 'dynamic rope', 'static rope', 'semi-static',
    'uiaa', 'en892', 'en1891', 'en362', 'en12275',
    'kn rating', 'breaking strength',
    'belay device', 'figure 8', 'atc', 'grigri',
    'carabiner', 'karabiner', 'quickdraw', 'sling',
    'harness', 'sit harness', 'full body harness',

    // ── Lock / Security ───────────────────────────────────────────────────────
    'bs3621', 'bs8621', 'bs en 1303', 'ts007',
    '5 lever', '5-lever', '6 lever', '6-lever',
    '5 pin', '6 pin', '7 pin',
    'sold secure gold', 'sold secure silver', 'sold secure bronze',
    'secured by design', 'police preferred',
    'grade 1', 'grade 2', 'grade 3',
    '3 star lock', '5 star lock',
    'anti-snap', 'anti-bump', 'anti-pick', 'anti-drill',
    'euro cylinder', 'rim lock', 'mortice lock', 'deadlock',

    // ── Archery ───────────────────────────────────────────────────────────────
    '20lb draw', '30lb draw', '40lb draw', '50lb draw', '60lb draw', '70lb draw',
    '24 inch draw', '26 inch draw', '28 inch draw', '30 inch draw',
    'recurve bow', 'compound bow', 'longbow', 'crossbow',
    'ibo speed', 'amo length',
    '400 spine', '340 spine', '300 spine',
    'carbon arrow', 'aluminium arrow', 'wooden arrow',

    // ── Scope / Optics ────────────────────────────────────────────────────────
    'zero stop', 'locking turret', 'tactical turret', 'capped turret',
    'illuminated reticle', 'mil dot', 'bdc reticle',
    'second focal plane', 'first focal plane',
    'nitrogen purged', 'argon purged', 'fog proof', 'waterproof scope',

    // ── Embroidery / Sewing ───────────────────────────────────────────────────
    '40wt', '50wt', '12wt', '28wt',
    'size 80 needle', 'size 90 needle', 'size 100 needle', 'size 110 needle',
    'size 11 needle', 'size 14 needle', 'size 16 needle', 'size 18 needle',
    '14/90 needle', '16/100 needle', '12/80 needle',
    'nm 70', 'nm 75', 'nm 80', 'nm 90', 'nm 100', 'nm 110',
    'universal needle', 'ballpoint needle', 'stretch needle', 'jeans needle',
    'embroidery needle', 'quilting needle', 'leather needle',

    // ── Chemistry grades ─────────────────────────────────────────────────────
    'analytical grade', 'technical grade', 'reagent grade',
    'pharmaceutical grade', 'usp grade', 'bp grade', 'ep grade',
    'acs grade', 'hplc grade', 'laboratory grade',
    '99.9% pure', '99.99% pure', '99.999% pure',

    // ── Radio ────────────────────────────────────────────────────────────────
    'pmr 446', 'pmr446', 'gmrs', 'frs', 'murs',
    'walkie talkie range', 'talk range',
    'channel 1', 'channel 2', 'channel 8', 'channel 16',
    'squelch', 'ctcss', 'dcs', 'vox',

    // ── Microscope ───────────────────────────────────────────────────────────
    '40x objective', '10x objective', '4x objective', '100x objective',
    'na 0.10', 'na 0.25', 'na 0.65', 'na 1.25',
    'brightfield', 'darkfield', 'phase contrast', 'fluorescence',
    'binocular head', 'trinocular head', 'monocular head',
    'mechanical stage', 'coaxial focus',


    // ── Battery sizes ────────────────────────────────────────────────────────
    'aa battery', 'aaa battery', 'c battery', 'd battery',
    'aa', 'aaa', 'aaaa', 'lr6', 'lr03', 'lr14', 'lr20',
    'cr2032', 'cr2025', 'cr2016', 'cr2450', 'cr2430',
    'cr123a', 'cr17345', 'cr-v3',
    'lr44', 'lr41', 'lr43', 'lr54', 'lr1130',
    'a23', 'a27', 'mn21', 'mn27',
    'alkaline battery', 'alkaline', 'lithium battery',
    'rechargeable battery', 'non-rechargeable',
    'nimh battery', 'nicd battery',
    '1.5v battery', '3v battery', '3.6v battery', '3.7v battery',

    // ── Wire gauge ────────────────────────────────────────────────────────────
    '18 awg', '20 awg', '22 awg', '24 awg', '26 awg', '28 awg',
    '16 awg', '14 awg', '12 awg', '10 awg', '8 awg', '6 awg',
    '18 swg', '20 swg', '22 swg', '24 swg',

    // ── BTU / HVAC ────────────────────────────────────────────────────────────
    '6000 btu', '9000 btu', '12000 btu', '18000 btu', '24000 btu', '36000 btu',
    '6kbtu', '9kbtu', '12kbtu', '18kbtu', '24kbtu',
    'r32 refrigerant', 'r410a refrigerant', 'r22 refrigerant', 'r290 refrigerant',
    'r32', 'r410a', 'r410', 'r22', 'r290', 'r600a',
    'eer rating', 'seer rating', 'cop rating',
    'inverter ac', 'non-inverter', 'fixed speed',
    'split system', 'multi split', 'cassette unit', 'ducted system',
    'hepa filter', 'hepa h13', 'hepa h14', 'true hepa',
    'h10', 'h11', 'h12', 'h13', 'h14',
    'merv 8', 'merv 11', 'merv 13', 'merv 16',
    'g3 filter', 'g4 filter', 'f7 filter', 'f9 filter',

    // ── Screen response ────────────────────────────────────────────────────────
    '1ms response', '2ms response', '4ms response', '5ms response',
    '0.5ms response', '0.1ms response',
    '1ms gtg', '4ms gtg',
    'mprt', 'gtg',
    'adaptive sync', 'freesync', 'g-sync', 'g sync',
    'freesync premium', 'g-sync compatible',

    // ── Load ratings ──────────────────────────────────────────────────────────
    'wll', 'swl', 'mbl',
    'wll 500kg', 'wll 1000kg', 'wll 2000kg', 'wll 3000kg',
    'swl 500kg', 'swl 1000kg', 'swl 2000kg',
    '0.5 tonne', '1 tonne', '2 tonne', '3 tonne', '5 tonne',
    '500kg capacity', '1000kg capacity', '2000kg capacity',
    '4:1 safety factor', '6:1 safety factor',

    // ── Yarn weight ────────────────────────────────────────────────────────────
    'dk weight', 'aran weight', 'chunky weight', 'super chunky',
    'lace weight', 'fingering weight', 'worsted weight',
    'double knit', 'dk yarn', 'aran yarn', 'chunky yarn',
    '4ply', '6ply', '8ply', '10ply', '12ply',
    '100g ball', '50g ball',
    'wool content', 'acrylic blend', 'cotton blend',

    // ── CE / Protection ───────────────────────────────────────────────────────
    'ce level 1', 'ce level 2',
    'en13594', 'en13634', 'en17092', 'en13595',
    'en1621-1', 'en1621-2', 'en1621-3', 'en1621-4',
    'aa rated', 'a rated', 'b rated abrasion',
    'd3o', 'sas-tec', 'knox', 'forcefield',

    // ── Seeds ────────────────────────────────────────────────────────────────
    'f1 hybrid', 'f1 seed', 'f2 hybrid', 'f2 seed',
    'open pollinated', 'op seed', 'heirloom seed',
    'treated seed', 'untreated seed', 'pelleted seed',
    'certified organic seed', 'rhs award',

    // ── Chainsaw ─────────────────────────────────────────────────────────────
    '0.325 pitch', '3/8 pitch', '0.043 gauge', '0.050 gauge', '0.058 gauge', '0.063 gauge',
    'oregon chain', 'stihl chain', 'husqvarna chain',
    '12 inch bar', '14 inch bar', '16 inch bar', '18 inch bar', '20 inch bar',
    '30cm bar', '35cm bar', '40cm bar', '45cm bar', '50cm bar',

    // ── Concrete ─────────────────────────────────────────────────────────────
    'c20 concrete', 'c25 concrete', 'c30 concrete', 'c35 concrete', 'c40 concrete',
    'st2 mix', 'st4 mix', 'st5 mix',
    '25n/mm2', '30n/mm2', '35n/mm2',
    'ready mix', 'ready-mix', 'self levelling', 'self-levelling',

    // ── Adhesive specs ────────────────────────────────────────────────────────
    'vhb tape', '3m vhb', 'double sided tape', 'double-sided',
    'permanent adhesive', 'removable adhesive',
    'contact adhesive', 'grab adhesive', 'no more nails',
    'epoxy adhesive', 'two part epoxy', '5 minute epoxy',
    'cyanoacrylate', 'ca glue', 'super glue',
    'silicone sealant', 'clear sealant', 'white sealant',
    'waterproof sealant', 'fire rated sealant',

    // ── Networking ────────────────────────────────────────────────────────────
    '10/100', '10/100/1000', 'gigabit', 'fast ethernet',
    'managed switch', 'unmanaged switch', 'poe switch',
    'vlan', 'qos', 'spanning tree', 'lacp',
    'sfp port', 'sfp+ port', 'qsfp port',
    'rj11', 'rs232', 'rs485', 'rs422',
    'modbus', 'canbus', 'profibus',

    // ── Musical tuning ────────────────────────────────────────────────────────
    'a=440', 'a=442', 'concert pitch', 'standard tuning',
    '440hz tuning', '442hz tuning',
    'low pitch', 'high pitch', 'bb pitch', 'c pitch', 'eb pitch',

    // ── Knitting tension ──────────────────────────────────────────────────────
    '10cm x 10cm', '4 inch x 4 inch',
    '22 stitches', '24 stitches', '28 stitches',

    // ── Paper specs ────────────────────────────────────────────────────────────
    'gloss paper', 'silk paper', 'matt paper', 'matte paper',
    'coated paper', 'uncoated paper', 'acid free paper',
    'archival quality', 'archival grade',
    'perforated paper', 'waterproof paper',
    '70gsm', '75gsm', '80gsm', '90gsm', '100gsm', '115gsm',
    '120gsm', '130gsm', '150gsm', '170gsm', '200gsm',
    '250gsm', '300gsm', '350gsm', '400gsm',


    // ── Bed sizes ─────────────────────────────────────────────────────────────
    'single', 'double', 'king size', 'queen size', 'super king', 'small double',
    'european king', 'eu king', 'european double',
    '3ft bed', '4ft bed', '4ft6 bed', '5ft bed', '6ft bed',
    '3ft mattress', '4ft6 mattress', '5ft mattress', '6ft mattress',
    '90x190cm', '90x200cm', '120x190cm', '120x200cm', '135x190cm', '135x200cm',
    '150x200cm', '160x200cm', '180x200cm', '200x200cm',
    '3ft single', '4ft small double', '4ft6 double', '5ft king', '6ft super king',

    // ── Mattress types / spring count ─────────────────────────────────────────
    'pocket sprung', 'open coil', 'orthopaedic', 'orthopedic',
    'reflex foam', 'latex foam', 'gel foam',
    '800 pocket', '1000 pocket', '1200 pocket', '1500 pocket',
    '2000 pocket', '2500 pocket', '3000 pocket',
    '800 spring', '1000 spring', '1500 spring', '2000 spring',
    'h2 firmness', 'h3 firmness', 'h4 firmness',
    'soft', 'medium', 'firm', 'extra firm',

    // ── Curtain header ─────────────────────────────────────────────────────────
    'eyelet', 'pencil pleat', 'pinch pleat', 'tab top', 'rod pocket',
    'ring top', 'wave heading', 'triple pleat', 'goblet pleat',
    'thermal lined', 'blackout lining', 'unlined', 'interlined',
    'pair of curtains', 'single panel', 'curtain pair',

    // ── Tile / Floor ──────────────────────────────────────────────────────────
    'r10', 'r11', 'r12', 'r13',
    'p3', 'p4', 'p5',
    'a+b+c rating',
    'rectified tile', 'non-rectified',
    'polished porcelain', 'matt porcelain', 'satin porcelain',
    'anti-slip tile', 'anti-slip rating',
    'floor tile', 'wall tile', 'floor and wall',
    'natural stone', 'travertine', 'slate tile', 'marble tile',
    'wood effect tile', 'concrete effect', 'stone effect',
    'gloss tile', 'lappato', 'structured',

    // ── Glass ────────────────────────────────────────────────────────────────
    'toughened glass', 'toughened safety glass',
    'laminated glass', 'laminated safety glass',
    'double glazed', 'double glazing', 'triple glazed', 'triple glazing',
    'frosted glass', 'acid etched', 'sandblasted glass',
    'low-e glass', 'low e coating', 'solar control glass',
    'argon filled', 'krypton filled',
    'u value 1.0', 'u value 1.2', 'u value 1.4', 'u value 1.6',
    'bs en 12150', 'bs en iso 12543', 'bs 6206',

    // ── Camera mounts ─────────────────────────────────────────────────────────
    'ef mount', 'ef-s mount', 'ef-m mount', 'rf mount',
    'f mount', 'z mount', 'dx format', 'fx format',
    'e mount', 'fe mount', 'a mount',
    'm43 mount', 'micro four thirds mount', 'mft mount',
    'pl mount', 'l mount', 'sa mount', 'sr mount',
    'k mount', 'x mount', 't mount', 'c mount',
    'full frame', 'aps-c', 'micro four thirds', 'medium format',
    '1 inch sensor', '1/2.3 inch', '1/2 inch', '1/1.7 inch',
    'crop factor 1.5', 'crop factor 1.6',

    // ── Audio impedance / spec ────────────────────────────────────────────────
    '16 ohm', '32 ohm', '64 ohm', '150 ohm', '250 ohm', '300 ohm', '600 ohm',
    '16Ω', '32Ω', '64Ω', '150Ω', '250Ω', '300Ω', '600Ω',
    'phantom power', '48v phantom', '48 volt phantom',
    'balanced xlr', 'balanced trs', 'unbalanced ts',
    'trs jack', 'ts jack', 'trrs jack',
    '-38 dbv', 'sensitivity -38', 'sensitivity -40',
    '20hz-20khz', '20hz to 20khz',
    'dynamic microphone', 'condenser microphone', 'ribbon microphone',
    'cardioid', 'omnidirectional', 'figure-8 pattern', 'supercardioid',
    'signal to noise ratio', 'snr', 'thd', 'total harmonic distortion',

    // ── Medical compression ────────────────────────────────────────────────────
    'mmhg', 'mm hg',
    '8-15 mmhg', '15-21 mmhg', '23-32 mmhg', '34-46 mmhg',
    'compression class 1', 'compression class 2', 'compression class 3',
    'compression grade 1', 'compression grade 2',
    'mild compression', 'moderate compression', 'firm compression',
    'fda cleared', 'fda approved', 'mhra approved', 'ce marked medical',
    'class i device', 'class iia device', 'class iib device', 'class iii device',

    // ── Toy / Child safety standards ──────────────────────────────────────────
    'bs en 71', 'en71', 'en 71', 'astm f963',
    'bs 5852', 'bs 7177', 'bs en 1888', 'bs en 14988',
    'suitable 3+', 'suitable 4+', 'suitable 5+', 'suitable 6+',
    'isofix', 'i-size', 'i size',
    'ece r44', 'ece r129', 'un r129', 'un r44',
    'group 0', 'group 0+', 'group 1', 'group 2', 'group 3', 'group 2/3', 'group 1/2/3',
    '0-13 kg', '9-18 kg', '15-36 kg', '0-18 kg',
    'rearward facing', 'forward facing', 'rearward-facing', 'forward-facing',
    'top tether', 'support leg', 'base station',

    // ── Nutrition ────────────────────────────────────────────────────────────
    'kcal', 'kj', 'cal',
    'rda', 'nrv', 'dv',
    'per 100g', 'per serving', 'per portion', 'per capsule', 'per tablet',
    'high protein', 'low fat', 'low sugar', 'no added sugar',
    'high fibre', 'low carb', 'zero sugar', 'sugar free',
    'net weight', 'gross weight', 'drained weight',
    '100 capsules', '60 capsules', '30 capsules', '90 capsules', '120 capsules',
    '30 tablets', '60 tablets', '90 tablets', '180 tablets',
    '100 servings', '60 servings', '30 servings',

    // ── Storage / Memory types ────────────────────────────────────────────────
    'emmc', 'emmc 5.0', 'emmc 5.1',
    'ufs 2.0', 'ufs 2.1', 'ufs 2.2', 'ufs 3.0', 'ufs 3.1',
    'gddr5', 'gddr5x', 'gddr6', 'gddr6x', 'gddr7',
    'hbm', 'hbm2', 'hbm2e', 'hbm3',
    'vram', 'dedicated vram',
    '2gb vram', '4gb vram', '6gb vram', '8gb vram', '10gb vram', '12gb vram', '16gb vram',
    'shared memory', 'dedicated graphics',

    // ── HVAC / Boiler extras ──────────────────────────────────────────────────
    'erp rating', 'sedbuk rating',
    'g3 standard', 'g3 unvented',
    'combi boiler', 'system boiler', 'regular boiler', 'back boiler',
    'central heating', 'underfloor heating', 'radiator',
    'btu/h', 'kbtu', '10000 btu', '12000 btu', '18000 btu', '24000 btu',
    'cop 3.0', 'cop 3.5', 'cop 4.0', 'cop 4.5', 'cop 5.0',
    'seer 12', 'seer 14', 'seer 16', 'seer 18', 'seer 20',
    'eer 10', 'eer 12',

    // ── Scaffold / Access ─────────────────────────────────────────────────────
    'bs en 1004', 'class 3 tower', 'class iii tower',
    'single width', 'double width', '1450mm wide', '850mm wide',
    '2m platform', '3m platform', '4m platform',
    'working height', 'platform height',

    // ── Roofing ──────────────────────────────────────────────────────────────
    'epdm', 'grp fibreglass', 'grp fiberglass',
    'torch on felt', 'self adhesive felt',
    'bs 8747', 'en 13707',
    'breathable membrane', 'vapour barrier', 'dpm',
    'ridge tile', 'hip tile', 'valley tile',
    'class 1 fire', 'class 2 fire', 'class 3 fire',


    // ── Watch water resistance ────────────────────────────────────────────────
    '5 atm', '10 atm', '20 atm', '30 atm', '50 atm', '100 atm', '200 atm',
    '5atm', '10atm', '20atm', '30atm',
    'wr30', 'wr50', 'wr100', 'wr200',
    '30m water resistant', '50m water resistant', '100m water resistant',
    '200m water resistant', '300m water resistant',
    '3 bar', '5 bar', '10 bar', '20 bar',
    'water resistant', 'waterproof watch', 'water proof',
    'diving watch', 'diver watch',

    // ── Watch movement ────────────────────────────────────────────────────────
    'automatic movement', 'automatic watch', 'self-winding', 'self winding',
    'mechanical movement', 'mechanical watch', 'manual wind', 'hand wound',
    'quartz movement', 'quartz watch', 'solar quartz', 'kinetic movement',
    'eco-drive', 'solar powered watch',
    'sapphire crystal', 'sapphire glass', 'mineral glass', 'hardlex crystal',
    'hesalite crystal', 'acrylic crystal',
    'swiss made', 'swiss movement', 'japan movement', 'miyota movement',
    'eta movement', 'seiko movement',
    'chronograph', 'chronometer', 'gmt', 'dual time', 'world time',
    'power reserve', 'date display', 'day date', 'moonphase',
    'skeleton dial', 'open heart', 'tourbillon',

    // ── Sunglass lens ─────────────────────────────────────────────────────────
    'cat 0', 'cat 1', 'cat 2', 'cat 3', 'cat 4',
    'category 0', 'category 1', 'category 2', 'category 3', 'category 4',
    'en iso 12312-1', 'ansi z87.1', 'as/nzs 1067',
    'uv380', 'uv400 protection',
    'polarised lens', 'polarized lens', 'photochromic lens',
    'mirrored lens', 'flash mirror', 'revo coating',
    'impact resistant', 'shatter proof', 'shatterproof',

    // ── Ring sizes UK ─────────────────────────────────────────────────────────
    'ring size d', 'ring size e', 'ring size f', 'ring size g', 'ring size h',
    'ring size i', 'ring size j', 'ring size k', 'ring size l', 'ring size m',
    'ring size n', 'ring size o', 'ring size p', 'ring size q', 'ring size r',
    'ring size s', 'ring size t', 'ring size u', 'ring size v', 'ring size w',
    'size d', 'size e', 'size f', 'size g', 'size h', 'size i', 'size j',
    'size k', 'size l', 'size m', 'size n', 'size o', 'size p', 'size q',
    'size r', 'size s', 'size t', 'size u', 'size v', 'size w',

    // ── Ring sizes US ────────────────────────────────────────────────────────
    'ring size 4', 'ring size 5', 'ring size 6', 'ring size 7', 'ring size 8',
    'ring size 9', 'ring size 10', 'ring size 11', 'ring size 12', 'ring size 13',
    'size 4.5', 'size 5.5', 'size 6.5', 'size 7.5', 'size 8.5', 'size 9.5',

    // ── Fabric wash temperatures ──────────────────────────────────────────────
    '30 degree wash', '40 degree wash', '60 degree wash', '90 degree wash',
    '30°c wash', '40°c wash', '60°c wash',
    'cold wash only', 'warm wash', 'hot wash',
    'machine washable', 'hand wash only', 'dry clean only',
    'do not tumble dry', 'tumble dry low', 'tumble dry medium',
    'iron low', 'iron medium', 'iron high', 'do not iron',
    'bleach safe', 'no bleach', 'chlorine free',

    // ── Fabric composition blends ─────────────────────────────────────────────
    '100% cotton', '100% polyester', '100% wool', '100% silk',
    '100% linen', '100% bamboo', '100% acrylic', '100% nylon',
    '100% cashmere', '100% merino wool', '100% leather',
    '95% cotton 5% elastane', '95% cotton 5% lycra',
    '80% cotton 20% polyester', '65% polyester 35% cotton',
    '50% cotton 50% polyester', '60% cotton 40% polyester',
    '100% recycled polyester', 'recycled material',
    'elastane content', 'lycra content', 'spandex content',
    'stretch fabric', '4-way stretch', '2-way stretch',
    'tencel', 'modal fabric', 'viscose', 'rayon',

    // ── Plating / Coating ─────────────────────────────────────────────────────
    '1 micron', '2 micron', '3 micron', '5 micron', '10 micron',
    'gold filled', 'gold vermeil', 'rose gold vermeil',
    'rhodium plated', 'silver plated', 'gold plated',
    'pvd coated', 'pvd coating', 'dlc coated', 'dlc coating',
    'ion plated', 'ip gold', 'ip black', 'ip rose gold', 'ip silver',
    'nitride coating', 'titanium coating', 'cerakote',
    'hard anodised', 'hard anodized', 'anodised', 'anodized',
    'electroplated', 'galvanised', 'galvanized', 'zinc plated',
    'nickel plated', 'chrome plated', 'copper plated', 'tin plated',

    // ── Helmet standards ─────────────────────────────────────────────────────
    'ece 22.06', 'ece 22.05', 'ece r22.06', 'ece r22.05',
    'dot approved', 'dot certified', 'dot compliant',
    'snell m2020', 'snell m2015', 'snell sa2020',
    'bs 6658', 'bs en 1078', 'bs en 1080',
    'en 1078', 'en 1080', 'en 12492', 'en 13087',
    'mips technology', 'mips liner', 'mips rotational protection',
    'fidlock buckle', 'magneto buckle', 'd-ring buckle',
    'full face helmet', 'open face helmet', 'modular helmet',
    'half shell', 'shorty helmet', 'adventure helmet',

    // ── Surge protection / Extension ─────────────────────────────────────────
    '900 joule', '1080 joule', '1700 joule', '2160 joule', '3420 joule',
    'surge protected', 'surge protection', 'overvoltage protection',
    '3 socket', '4 socket', '5 socket', '6 socket', '8 socket', '10 socket',
    '3 way', '4 way', '5 way', '6 way', '8 way', '10 way',
    '3 outlet', '4 outlet', '6 outlet', '8 outlet',
    'usb charging ports', 'with usb', 'with usb-c',
    'individually switched', 'master switch', 'child safe sockets',

    // ── Advanced networking ───────────────────────────────────────────────────
    '2.5g ethernet', '10g ethernet', '25g ethernet', '40g ethernet', '100g ethernet',
    '2.5 gigabit', '10 gigabit', '25 gigabit',
    '25g sfp', '40g qsfp', '100g qsfp',
    'lacp bonding', 'link aggregation', '802.3ad',
    'jumbo frames', '9000 mtu', '9600 mtu',
    'layer 2', 'layer 3', 'managed l2', 'managed l3',
    'ipv6 ready', 'ipv6 support',

    // ── Advanced processor specs ──────────────────────────────────────────────
    'snapdragon 8 gen 1', 'snapdragon 8 gen 2', 'snapdragon 8 gen 3',
    'snapdragon 888', 'snapdragon 870', 'snapdragon 778g', 'snapdragon 680',
    'dimensity 9200', 'dimensity 9000', 'dimensity 1200', 'dimensity 700',
    'apple a17 pro', 'apple a16 bionic', 'apple a15 bionic', 'apple a14 bionic',
    'intel i3', 'intel i5', 'intel i7', 'intel i9',
    'intel core ultra', 'intel n95', 'intel n100',
    'amd ryzen 3', 'amd ryzen 5', 'amd ryzen 7', 'amd ryzen 9',
    'rtx 4090', 'rtx 4080', 'rtx 4070', 'rtx 4060', 'rtx 3090', 'rtx 3080',
    'rx 7900 xtx', 'rx 7800 xt', 'rx 6700 xt',
    'arc a770', 'arc a750',

    // ── Photography extras ────────────────────────────────────────────────────
    'mechanical shutter', 'electronic shutter', 'global shutter', 'rolling shutter',
    'x-sync', 'flash sync', '1/250s sync', '1/500s sync',
    'in-body stabilisation', 'ibis', '5-axis stabilisation',
    'eye tracking af', 'subject tracking', 'animal detection',
    'pre-burst', 'pro capture', 'live nd', 'pixel shift',
    'log format', 'log profile', 's-log', 'c-log', 'n-log', 'l-log', 'v-log',
    'raw video', '12-bit raw', '14-bit raw',
    'anamorphic', 'cinemascope',

    // ── Missing sensor sizes ──────────────────────────────────────────────────
    '1/2.3 inch sensor', '1/1.7 inch sensor', '1/1.3 inch sensor',
    '1 inch sensor', '4/3 sensor', 'micro four thirds sensor',
    'aps-c sensor', 'full frame sensor', 'medium format sensor',
    '35mm equivalent', 'crop sensor',

    // ── Gaming ───────────────────────────────────────────────────────────────
    'ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'psp', 'ps vita',
    'xbox', 'xbox 360', 'xbox one', 'xbox series x', 'xbox series s',
    'nintendo switch', 'switch oled', 'switch lite',
    'game boy', 'gba', 'ds', '3ds', '2ds',
    'pal', 'ntsc', 'region free', 'region 1', 'region 2',
    'digital code', 'dlc', 'season pass', 'game pass',

    // ── Clothing details ──────────────────────────────────────────────────────
    'uk 6', 'uk 8', 'uk 10', 'uk 12', 'uk 14', 'uk 16', 'uk 18', 'uk 20', 'uk 22',
    'us 0', 'us 2', 'us 4', 'us 6', 'us 8', 'us 10', 'us 12', 'us 14',
    'eu 32', 'eu 34', 'eu 36', 'eu 38', 'eu 40', 'eu 42', 'eu 44', 'eu 46',
    'waist 28', 'waist 30', 'waist 32', 'waist 34', 'waist 36', 'waist 38',
    'chest 36', 'chest 38', 'chest 40', 'chest 42', 'chest 44',
    'inside leg 28', 'inside leg 30', 'inside leg 32', 'inside leg 34',

    // ── Shoe sizes ────────────────────────────────────────────────────────────
    'uk 3', 'uk 4', 'uk 5', 'uk 6', 'uk 7', 'uk 8', 'uk 9', 'uk 10', 'uk 11', 'uk 12', 'uk 13',
    'us 5', 'us 6', 'us 7', 'us 8', 'us 9', 'us 10', 'us 11', 'us 12', 'us 13', 'us 14',
    'eu 35', 'eu 36', 'eu 37', 'eu 38', 'eu 39', 'eu 40', 'eu 41', 'eu 42', 'eu 43', 'eu 44', 'eu 45', 'eu 46', 'eu 47',

    // ── Jewellery grades & certifications ────────────────────────────────────
    '925 hallmark', '750 hallmark', '585 hallmark', '375 hallmark', '999 hallmark',
    'vvs1', 'vvs2', 'vs1', 'vs2', 'si1', 'si2', 'i1', 'i2', 'i3',
    'if clarity', 'fl clarity', 'vvs clarity', 'vs clarity', 'si clarity',
    'd colour', 'e colour', 'f colour', 'g colour', 'h colour', 'i colour', 'j colour',
    'ideal cut', 'excellent cut', 'very good cut', 'good cut',
    'round brilliant', 'princess cut', 'cushion cut', 'oval cut', 'pear cut',
    'emerald cut', 'asscher cut', 'radiant cut', 'marquise cut', 'heart cut',
    'gia certified', 'igi certified', 'egl certified', 'ags certified', 'hrd certified',
    'lab grown', 'lab created', 'natural diamond', 'synthetic diamond',
    'moissanite', 'cubic zirconia', 'cz stone',
    'conflict free', 'ethically sourced', 'fairtrade gold',

    // ── Phone/Mobile specs ────────────────────────────────────────────────────
    'dual sim', 'triple sim', 'nano sim', 'micro sim', 'esim', 'e-sim', 'sim free',
    'unlocked', 'network unlocked', 'sim locked', 'carrier locked',
    '5g ready', '5g enabled', '4g lte', '4g ready', '3g', '2g',
    'ip68 rated', 'ip67 rated', 'ip65 rated', 'military grade', 'drop proof',
    'gorilla glass victus', 'gorilla glass 7i', 'gorilla glass 6', 'gorilla glass 5',
    'under display fingerprint', 'in screen fingerprint', 'side fingerprint',
    'face id', 'face unlock', 'fingerprint sensor', 'iris scanner',
    'wireless charging', 'magsafe', 'qi charging', 'reverse wireless charging',

    // ── Gaming platform & specs ───────────────────────────────────────────────
    'dlss 3', 'dlss 2', 'fsr 2', 'fsr 3', 'xess', 'ray tracing', 'ray-tracing',
    'g-sync', 'freesync', 'adaptive sync', 'vrr', 'hdmi 2.1 vrr',
    'nvme ssd', 'nvme storage', 'ssd storage', 'hdd storage',
    'ps5 compatible', 'ps4 compatible', 'xbox series x', 'xbox series s',
    'nintendo switch oled', 'nintendo switch lite',
    'steam deck', 'valve index',
    'pal version', 'ntsc version', 'region free', 'all regions',
    'new sealed', 'factory sealed', 'brand new sealed',

    // ── Medical & Health specs ────────────────────────────────────────────────
    'fda approved', 'fda cleared', 'ce marked', 'mhra approved', 'mdd', 'mdr',
    'iso 13485', 'iso 9001', 'class i medical', 'class ii medical', 'class iii medical',
    'tens unit', 'ems unit', 'nmes unit', 'interferential', 'ultrasound therapy',
    'cpap', 'bipap', 'apap', 'auto cpap', 'travel cpap',
    'blood pressure monitor', 'pulse oximeter', 'glucose meter', 'peak flow meter',
    'nebuliser', 'nebulizer', 'inhaler', 'spacer device',
    'grade 1 compression', 'grade 2 compression', 'class 1', 'class 2', 'class 3',
    'anti-embolism', 'ted stockings', 'compression socks 15-21mmhg',
    'compression socks 20-30mmhg', 'compression socks 30-40mmhg',

    // ── Automotive specs ──────────────────────────────────────────────────────
    'petrol', 'diesel', 'hybrid', 'electric', 'phev', 'mhev', 'fhev', 'bev',
    'manual gearbox', 'automatic gearbox', 'cvt gearbox', 'dct gearbox',
    '2wd', '4wd', 'awd', 'fwd', 'rwd', '4x4', 'four wheel drive', 'all wheel drive',
    'saloon', 'hatchback', 'estate', 'suv', 'coupe', 'convertible', 'pickup', 'van', 'mpv',
    'left hand drive', 'right hand drive', 'lhd', 'rhd',
    'mot tested', 'mot exempt', 'v5c', 'logbook',
    'oem part', 'genuine part', 'aftermarket part', 'pattern part',
    'summer tyre', 'winter tyre', 'all season tyre', 'all weather tyre',
    'run flat', 'runflat', 'xl tyre', 'c rated', 'load rated',
    'turbo diesel', 'turbocharged', 'supercharged', 'naturally aspirated',
    'twin turbo', 'bi turbo', 'single turbo',

    // ── Books & Media formats ─────────────────────────────────────────────────
    'hardback', 'hardcover', 'paperback', 'softcover', 'mass market paperback',
    'trade paperback', 'large print', 'braille', 'audio book', 'audiobook',
    'abridged', 'unabridged', 'graphic novel', 'illustrated edition',
    'signed copy', 'first edition', 'first printing', 'first impression',
    '4k blu-ray', '4k ultra hd', 'steelbook', 'digipak', 'mediabook',
    'blu-ray', 'blu ray', 'dvd', 'hd dvd', 'laserdisc', 'vhs', 'betamax',
    'dolby vision', 'dolby atmos audio', 'dts-hd', 'dts:x', 'imax enhanced',

    // ── Hair extension specs ──────────────────────────────────────────────────
    'remy hair', 'virgin hair', 'human hair', 'synthetic hair',
    'clip in', 'tape in', 'keratin bond', 'micro ring', 'nano ring', 'weave',
    'straight hair', 'wavy hair', 'curly hair', 'kinky straight', 'afro kinky',
    'heat resistant', 'heat friendly', 'natural look',
    '100g bundle', '150g bundle', '200g bundle', '300g bundle',
    '14 inch', '16 inch', '18 inch', '20 inch', '22 inch', '24 inch', '26 inch hair',

    // ── Fitness & Gym specs ───────────────────────────────────────────────────
    'olympic barbell', 'ez bar', 'trap bar', 'safety squat bar',
    'competition plate', 'bumper plate', 'cast iron plate', 'rubber plate',
    'adjustable dumbbell', 'fixed dumbbell', 'hex dumbbell', 'urethane dumbbell',
    'pull up bar', 'chin up bar', 'dip bar',
    'treadmill', 'elliptical', 'rowing machine', 'spin bike', 'exercise bike',
    'folding treadmill', 'motorised treadmill', 'manual treadmill',

    // ── Mattress & Bedding specs ──────────────────────────────────────────────
    'open coil', 'pocket spring', 'memory foam', 'latex mattress', 'hybrid mattress',
    'gel memory foam', 'gel foam', 'reflex foam', 'orthopaedic mattress',
    'firm mattress', 'medium mattress', 'soft mattress', 'pillow top', 'euro top',
    '1000 pocket', '1500 pocket', '2000 pocket', '2500 pocket', '3000 pocket',

    // ── Drone specs ───────────────────────────────────────────────────────────
    '4k camera', '4k video', '2.7k video', '1080p video', 'uhd camera',
    '30 min flight', '25 min flight', '20 min flight',
    'obstacle avoidance', 'gps drone', 'brushless motor drone',
    'fpv drone', 'racing drone', 'cinematic drone',
    'dji mini', 'dji air', 'dji mavic', 'dji phantom',

    // ── Welding specs ─────────────────────────────────────────────────────────
    'mig welder', 'tig welder', 'mma welder', 'stick welder', 'plasma cutter',
    'gasless mig', 'no gas mig', 'co2 welding', 'argon welding', 'mixed gas',
    'inverter welder', 'transformer welder',
    '140 amp', '160 amp', '180 amp', '200 amp', '250 amp welder',

    // ── Electrical extra ──────────────────────────────────────────────────────
    'spst switch', 'spdt switch', 'dpst switch', 'dpdt switch',
    'normally open', 'normally closed', 'no contact', 'nc contact',
    'single pole', 'double pole', 'triple pole',
    'mcb', 'rcd', 'rcbo', 'consumer unit', 'fuse box', 'distribution board',
    '6a mcb', '10a mcb', '16a mcb', '20a mcb', '32a mcb', '40a mcb', '63a mcb',
    '30ma rcd', '100ma rcd', '300ma rcd',

    // ── Fishing specs ─────────────────────────────────────────────────────────
    'monofilament line', 'fluorocarbon line', 'braided line', 'braid line',
    'front drag reel', 'rear drag reel', 'baitrunner reel', 'baitcaster reel',
    'barbless hook', 'barbed hook', 'wide gape hook', 'long shank hook',
    'fixed spool reel', 'multiplier reel', 'centre pin reel', 'fly reel',
    'feeder rod', 'match rod', 'carp rod', 'pike rod', 'fly rod', 'spinning rod',
    'carbon fibre rod', 'fibreglass rod', 'composite rod',

    // ── Camping & Outdoor ─────────────────────────────────────────────────────
    '2 person tent', '3 person tent', '4 person tent', '6 person tent', '8 person tent',
    '1 season', '2 season', '3 season', '4 season', '5 season',
    '500 fill power', '600 fill power', '700 fill power', '800 fill power', '900 fill power',
    'down sleeping bag', 'synthetic sleeping bag', 'hollow fibre sleeping bag',
    'mummy sleeping bag', 'semi rectangular', 'rectangular sleeping bag',
    'self inflating mat', 'foam sleeping mat', 'inflatable sleeping mat',
    'waterproof jacket', 'breathable jacket', 'gore-tex', 'gore tex', 'pertex',
    'hydrostatic head 1000mm', 'hydrostatic head 2000mm', 'hydrostatic head 3000mm',
    'hydrostatic head 5000mm', 'hydrostatic head 10000mm',

    // ── Candle & Home fragrance ───────────────────────────────────────────────
    'soy wax', 'paraffin wax', 'beeswax', 'coconut wax', 'rapeseed wax',
    'cotton wick', 'wooden wick', 'crackling wick',
    '40 hour burn', '50 hour burn', '60 hour burn', '80 hour burn',
    'reed diffuser', 'electric diffuser', 'ultrasonic diffuser', 'wax melt',

    // ── Plumbing & Heating ────────────────────────────────────────────────────
    'combi boiler', 'system boiler', 'heat only boiler', 'back boiler',
    'condensing boiler', 'worcester bosch', 'vaillant', 'baxi', 'ideal boiler',
    '24kw boiler', '28kw boiler', '30kw boiler', '35kw boiler', '40kw boiler',
    'solar thermal', 'solar panel', 'photovoltaic', 'pv panel',
    'underfloor heating', 'electric underfloor heating', 'water underfloor heating',
    'towel rail', 'heated towel rail', 'dual fuel towel rail',

    // ── Thread count ──────────────────────────────────────────────────────────
    '100 thread count', '200 thread count', '300 thread count', '400 thread count',
    '500 thread count', '600 thread count', '800 thread count', '1000 thread count',
    'egyptian cotton 400tc', 'egyptian cotton 200tc', 'egyptian cotton 300tc',

    // ── Camera focal lengths ──────────────────────────────────────────────────
    '18-55mm', '50mm', '24mm', '35mm', '85mm', '70-200mm', '16-35mm',

    // ── Condition words — buyers filter by these ──────────────────────────────
    'new', 'used', 'refurbished', 'faulty', 'graded', 'pre-owned', 'preowned',
    'open box', 'like new', 'very good', 'good condition', 'acceptable',
    'for parts', 'for spares', 'untested', 'as seen', 'as is', 'unboxed',
    'grade a', 'grade b', 'grade c', 'grade a+', 'grade ab',
    'seller refurbished', 'manufacturer refurbished', 'certified refurbished',
    'lightly used', 'heavily used', 'well used', 'barely used',
    'mint condition', 'excellent condition', 'good working order',

    // ── Quantity/Pack specs ───────────────────────────────────────────────────
    'x2', 'x3', 'x4', 'x5', 'x6', 'x8', 'x10', 'x12', 'x20', 'x50', 'x100',
    '2x', '3x', '4x', '5x', '6x', '8x', '10x', '12x', '20x', '50x', '100x',
    'double pack', 'triple pack', 'twin pack', 'quad pack',
    'pair of', 'set of 2', 'set of 3', 'set of 4', 'set of 5', 'set of 6',
    'set of 8', 'set of 10', 'set of 12', 'set of 20',
    '2 pack', '3 pack', '4 pack', '5 pack', '6 pack', '8 pack',
    '10 pack', '12 pack', '20 pack', '50 pack', '100 pack',
    '2pcs', '3pcs', '4pcs', '5pcs', '6pcs', '8pcs', '10pcs', '12pcs', '20pcs',
    '50pcs', '100pcs', '200pcs', '500pcs', '1000pcs',
    'single', 'pair', 'bundle', 'bulk', 'job lot', 'joblot', 'multipack',

    // ── Baby age/size specs ───────────────────────────────────────────────────
    'newborn', 'premature', 'tiny baby',
    '0-3 months', '3-6 months', '6-9 months', '6-12 months', '9-12 months',
    '12-18 months', '18-24 months', '0-1 years', '1-2 years', '2-3 years',
    '3-4 years', '4-5 years', '5-6 years', '6-7 years', '7-8 years',
    '8-9 years', '9-10 years', '10-11 years', '11-12 years',
    'birth to 3', 'birth to 6', 'birth to 12',
    'size 1 nappy', 'size 2 nappy', 'size 3 nappy', 'size 4 nappy',
    'size 5 nappy', 'size 6 nappy', 'size 7 nappy',
    'stage 1 teat', 'stage 2 teat', 'stage 3 teat', 'stage 4 teat',
    'slow flow', 'medium flow', 'fast flow', 'variable flow',
    '120ml bottle', '150ml bottle', '250ml bottle', '300ml bottle',

    // ── Voltage/Region systems ────────────────────────────────────────────────
    '110v-240v', '100-240v', '110-240v', '100v-240v',
    '50/60hz', '50-60hz',
    'dual voltage', 'multi voltage', 'universal voltage', 'worldwide voltage',
    'worldwide compatible', 'multi-region', 'region free',

    // ── Paint / DIY specs ─────────────────────────────────────────────────────
    'silk finish', 'matt finish', 'gloss finish', 'satin finish',
    'eggshell finish', 'satinwood', 'masonry', 'primer', 'undercoat', 'emulsion',
    'water based', 'oil based', 'solvent based', 'quick dry', 'one coat',
    'interior', 'exterior', 'interior exterior', 'all purpose',
    'coverage 10m2', 'coverage 12m2', 'coverage 15m2', 'coverage 20m2',
    '1 litre tin', '2.5 litre tin', '5 litre tin', '10 litre tin',

    // ── Garden/Plant specs ────────────────────────────────────────────────────
    '1 litre pot', '2 litre pot', '3 litre pot', '5 litre pot',
    '7 litre pot', '10 litre pot', '15 litre pot', '20 litre pot',
    '1 gallon pot', '2 gallon pot', '3 gallon pot', '5 gallon pot',
    'hardy annual', 'half hardy annual', 'hardy perennial', 'half hardy perennial',
    'hardy biennial', 'hardy bulb', 'half hardy bulb',
    'climbing', 'trailing', 'bushy', 'spreading', 'upright', 'compact habit',
    'full sun', 'partial shade', 'full shade', 'sun or shade',
    'rhs award of garden merit', 'rhs agm',
    'ph 5.5', 'ph 6.0', 'ph 6.5', 'ph 7.0', 'ph 7.5',
    'npk 10-10-10', 'npk 5-5-5', 'npk 20-20-20',

    // ── Watch specs ───────────────────────────────────────────────────────────
    'automatic movement', 'quartz movement', 'mechanical movement',
    'hand wound', 'self winding', 'automatic winding',
    'mineral glass', 'hardlex', 'hesalite', 'acrylic glass',
    'luminous hands', 'luminous indices', 'luminous markers',
    'chronograph', 'chronometer', 'date display', 'day date',
    'moon phase', 'tourbillon', 'perpetual calendar', 'annual calendar',
    'power reserve', 'power reserve indicator',
    '3 atm', '5 atm', '10 atm', '20 atm', '30 atm', '50 atm', '100 atm',
    '30m water resistant', '50m water resistant', '100m water resistant',
    '200m water resistant', '300m water resistant',
    '3bar', '5bar', '10bar', '20bar', '30bar',
    '30 bar water resistant', '50 bar water resistant',
    'sapphire coated', 'anti-reflective coating', 'ar coating',

    // ── Mattress/Bed sizes ────────────────────────────────────────────────────
    'single bed', 'small single', 'standard single',
    'small double', 'full double', 'standard double',
    'king size', 'standard king', 'super king', 'emperor',
    'eu single', 'eu double', 'eu king', 'eu super king',
    'cot size', 'cot bed size', 'toddler bed',
    '90x190cm', '90x200cm', '135x190cm', '135x200cm',
    '150x200cm', '160x200cm', '180x200cm', '200x200cm',

    // ── Audio/Speaker specs ───────────────────────────────────────────────────
    '4 ohm', '8 ohm', '16 ohm', '32 ohm', '64 ohm', '300 ohm',
    '4ohm', '8ohm', '16ohm', '32ohm', '64ohm', '300ohm',
    'rms power', 'peak power', 'program power',
    'frequency response 20hz', 'frequency response 20-20khz',
    'signal to noise ratio', 'snr', 'thd', 'total harmonic distortion',
    'sensitivity 85db', 'sensitivity 90db', 'sensitivity 95db', 'sensitivity 100db',

    // ── Music/Instrument tuning ───────────────────────────────────────────────
    'concert pitch', 'standard tuning', 'a=440', 'a=440hz', 'a=432hz',
    '6 string', '7 string', '12 string', '4 string bass', '5 string bass',
    'short scale', 'long scale', 'medium scale',
    'standard scale', 'baritone scale',

    // ── Climbing/Rope specs ───────────────────────────────────────────────────
    '8mm rope', '9mm rope', '9.5mm rope', '10mm rope', '11mm rope',
    '30m rope', '40m rope', '50m rope', '60m rope', '70m rope',
    'single rope', 'half rope', 'twin rope', 'dry treated',
    'uiaa certified', 'ce en892', 'ce en566',

    // ── Lens/Optical specs ────────────────────────────────────────────────────
    'prescription', 'non prescription', 'reading glasses',
    '+1.0', '+1.5', '+2.0', '+2.5', '+3.0', '+3.5', '+4.0',
    '-1.0', '-1.5', '-2.0', '-2.5', '-3.0', '-3.5', '-4.0',
    '1.50 index', '1.53 index', '1.56 index', '1.60 index', '1.67 index',
    'single vision', 'bifocal', 'varifocal', 'progressive',
    'anti blue light', 'blue light blocking', 'photochromic', 'transition',

    // ── Electrical/Plumbing ───────────────────────────────────────────────────
    '1 gang', '2 gang', '3 gang', '4 gang', '5 gang', '6 gang',
    '13 amp', '16 amp', '20 amp', '32 amp', '40 amp', '63 amp',
    '10mm copper', '15mm copper', '22mm copper', '28mm copper',
    '15mm fitting', '22mm fitting', '28mm fitting',
    'push fit', 'compression', 'solder ring', 'end feed',
    'bsp', 'npt', 'bspp', 'bspt',
    '1/4 inch', '3/8 inch', '1/2 inch', '3/4 inch', '1 inch',

    // ── Fishing specs ─────────────────────────────────────────────────────────
    '6ft rod', '7ft rod', '8ft rod', '9ft rod', '10ft rod', '11ft rod', '12ft rod',
    '6\' rod', '7\' rod', '8\' rod', '9\' rod', '10\' rod',
    '1 piece', '2 piece', '3 piece', '4 piece rod',
    '1lb tc', '1.5lb tc', '2lb tc', '2.5lb tc', '3lb tc', '3.5lb tc',
    '6lb line', '8lb line', '10lb line', '12lb line', '15lb line', '20lb line',
    'size 10 hook', 'size 12 hook', 'size 14 hook', 'size 16 hook',
    'size 18 hook', 'size 20 hook',
    '1000 reel', '2000 reel', '3000 reel', '4000 reel', '5000 reel',
    'front drag', 'rear drag', 'baitrunner',
    'monofilament', 'fluorocarbon', 'braided line', 'braid',

    // ── Trading card grades & variants ────────────────────────────────────────
    'psa 10', 'psa 9', 'psa 8', 'psa 7', 'psa 6', 'psa 5',
    'bgs 10', 'bgs 9.5', 'bgs 9', 'bgs 8.5', 'bgs 8',
    'cgc 10', 'cgc 9.5', 'cgc 9', 'cgc 8.5',
    'gem mint', 'near mint', 'lightly played', 'moderately played', 'heavily played',
    '1st edition', 'first edition', 'shadowless', 'unlimited print',
    'holographic', 'holo rare', 'reverse holo', 'full art card', 'secret rare',
    'ultra rare', 'hyper rare', 'rainbow rare', 'gold rare', 'alt art',
    'booster pack', 'booster box', 'elite trainer box', 'theme deck',
    'pokemon card', 'yugioh card', 'magic the gathering', 'mtg card',
    'sports card', 'rookie card', 'auto card', 'autograph card', 'patch card',
    'numbered card', 'serial numbered',

    // ── Flooring specs ────────────────────────────────────────────────────────
    'ac1 rated', 'ac2 rated', 'ac3 rated', 'ac4 rated', 'ac5 rated', 'ac6 rated',
    'class 21', 'class 22', 'class 23', 'class 31', 'class 32', 'class 33',
    'click lock', 'click fit', 'tongue and groove', 'glue down', 'loose lay', 'floating floor',
    'waterproof laminate', 'water resistant laminate', 'engineered wood',
    'solid wood floor', 'lvt flooring', 'lvp flooring', 'vinyl plank', 'vinyl tile',
    'herringbone', 'chevron', 'parquet', 'wood effect', 'stone effect', 'tile effect',
    '6mm thick floor', '7mm thick floor', '8mm thick floor', '10mm thick floor', '12mm thick floor',
    '0.3mm wear layer', '0.5mm wear layer', '1mm wear layer', '2mm wear layer',
    'underfloor heating compatible', 'suitable underfloor heating',
    'ab grade', 'abc grade', 'rustic grade', 'prime grade', 'select grade',

    // ── Equestrian specs ──────────────────────────────────────────────────────
    'pony size', 'cob size', 'full size equestrian', 'extra full size',
    '100g fill rug', '150g fill rug', '200g fill rug', '300g fill rug', '400g fill rug',
    'turnout rug', 'stable rug', 'fly rug', 'cooler rug', 'fleece rug',
    'high neck rug', 'combo neck rug', 'detachable neck rug',
    'snaffle bit', 'pelham bit', 'kimblewick bit', 'weymouth bit',
    'loose ring snaffle', 'full cheek snaffle', 'd ring snaffle', 'eggbutt snaffle',
    'dressage saddle', 'jumping saddle', 'general purpose saddle', 'endurance saddle',
    'narrow fit saddle', 'medium fit saddle', 'wide fit saddle', 'extra wide fit saddle',
    'jodhpur boots', 'field boots', 'long riding boots', 'half chaps',

    // ── Coin & Bullion specs ──────────────────────────────────────────────────
    'proof coin', 'bu coin', 'brilliant uncirculated', 'uncirculated coin',
    'circulated coin', '.999 fine silver', '.9999 fine gold',
    '1 troy oz', '1/2 troy oz', '1/4 troy oz', '1/10 troy oz',
    '1oz gold coin', '1oz silver coin', '5oz silver', '10oz silver',
    'sovereign coin', 'half sovereign', 'britannia coin', 'krugerrand',
    'maple leaf coin', 'american eagle coin', 'philharmonic coin',
    'royal mint', 'perth mint', 'us mint', 'royal canadian mint',
    'gold bullion', 'silver bullion', 'platinum coin', 'palladium coin',

    // ── Pet food & treatment ──────────────────────────────────────────────────
    'grain free pet', 'hypoallergenic pet food', 'limited ingredient diet',
    'raw pet food', 'barf pet diet', 'air dried pet food', 'freeze dried pet',
    'puppy food', 'kitten food', 'adult dog food', 'senior dog food',
    'small breed dog food', 'large breed dog food', 'giant breed food',
    'wet dog food', 'dry dog food', 'dog kibble', 'cat kibble',
    'flea spot on', 'tick treatment', 'combined wormer', 'flea collar',
    'for dogs under 8kg', 'for dogs 8-25kg', 'for dogs over 25kg',
    'for cats under 4kg', 'for cats over 4kg',

    // ── Garden extras ────────────────────────────────────────────────────────
    'ready to use spray', 'concentrate formula', 'dilute before use',
    'systemic weedkiller', 'contact weedkiller', 'selective weedkiller',
    'non selective weedkiller', 'residual weedkiller', 'root killer',
    'liquid fertiliser', 'granular fertiliser', 'slow release fertiliser',
    'organic fertiliser', 'chelated iron', 'ericaceous compost',
    'multipurpose compost', 'john innes no 1', 'john innes no 2', 'john innes no 3',
    '60l compost', '70l compost', '80l compost', '100l compost',
    'drip irrigation', 'seep hose', 'drip tape', 'micro irrigation',

    // ── Art supplies ─────────────────────────────────────────────────────────
    'student grade art', 'professional grade art', 'artist grade',
    'lightfast i', 'lightfast ii', 'lightfast iii', 'astm i lightfast', 'astm ii lightfast',
    'single pigment colour', 'transparent paint', 'opaque paint',
    'cold press paper', 'hot press paper', 'rough paper',
    '300gsm paper', '200gsm paper', '640gsm paper',
    'oil paint', 'acrylic paint', 'watercolour paint', 'gouache paint',
    'soft pastel', 'oil pastel', 'chalk pastel',
    '2h pencil', 'h pencil', 'hb pencil', 'b pencil', '2b pencil',
    '4b pencil', '6b pencil', '8b pencil',
    '21ml tube paint', '37ml tube paint', '60ml tube paint', '150ml tube paint',

    // ── Watch extras ──────────────────────────────────────────────────────────
    '17 jewels movement', '21 jewels movement', '25 jewels movement',
    '28800 bph movement', '21600 bph movement', '36000 bph movement',
    'unidirectional bezel', 'bidirectional bezel', 'fixed bezel', 'fluted bezel',
    'nato strap watch', 'rubber strap watch', 'leather strap watch',
    'milanese strap', 'jubilee bracelet watch', 'oyster bracelet watch',
    '18mm lug width', '20mm lug width', '22mm lug width',
    'exhibition caseback', 'skeleton caseback',

    // ── Knife/Blade extras ────────────────────────────────────────────────────
    'vg10 steel', 'vg1 steel', 'aus8 steel', 'aus10 steel', 'd2 tool steel',
    's30v steel', 's35vn steel', 'm390 steel', '1095 carbon steel', '1084 steel',
    'full tang knife', 'partial tang knife', 'hidden tang knife',
    'hollow grind', 'flat grind', 'convex grind', 'scandi grind',
    'hrc 58-60', 'hrc 60-62', 'hrc 62-64',
    'g10 handle', 'micarta handle', 'kydex sheath', 'leather sheath',

    // ── 3D Printing extras ────────────────────────────────────────────────────
    'pla filament', 'abs filament', 'petg filament', 'tpu filament',
    'asa filament', 'carbon fibre filament',
    '1.75mm pla', '1.75mm abs', '1.75mm petg',
    'fdm printer', 'sla printer', 'resin printer', 'dlp printer',
    '50 micron resolution', '25 micron resolution',

    // ── Electric vehicle extras ───────────────────────────────────────────────
    'pedal assist ebike', 'throttle ebike', 'pedelec ebike',
    '250w ebike motor', '500w motor ebike', '750w motor ebike',
    '36v battery ebike', '48v battery ebike',
    'electric scooter', 'electric bike', 'e-scooter', 'foldable ebike',
    '25 mile range', '30 mile range', '40 mile range', '50 mile range ebike',

    // ── Board sports extras ───────────────────────────────────────────────────
    'abec 5 bearings', 'abec 7 bearings', 'abec 9 bearings',
    '7.5 inch deck', '8.0 inch deck', '8.25 inch deck', '8.5 inch deck',
    'stiff flex board', 'medium flex board', 'soft flex board',
    'maple skateboard deck', 'bamboo deck skateboard',
    'all mountain ski', 'powder ski', 'carving ski', 'park ski',

    // ── Perfume / Fragrance ───────────────────────────────────────────────────
    'eau de parfum', 'eau de toilette', 'eau de cologne', 'extrait de parfum',
    'edp spray', 'edt spray', 'parfum spray',
    '30ml spray', '50ml spray', '75ml spray', '100ml spray', '125ml spray',
    '150ml spray', '200ml spray',
    'oriental fragrance', 'floral fragrance', 'woody fragrance',
    'fresh fragrance', 'citrus fragrance', 'aquatic fragrance',
    'top notes', 'heart notes', 'base notes', 'middle notes',

    // ── Hi-Fi / Audio equipment ───────────────────────────────────────────────
    'class a amplifier', 'class ab amplifier', 'class d amplifier', 'class h amplifier',
    'tube amplifier', 'valve amplifier', 'solid state amplifier',
    'integrated amplifier', 'power amplifier', 'preamplifier', 'phono stage',
    'dac', 'digital to analogue', 'analogue to digital', 'adc',
    '192khz', '384khz', '768khz', '32 bit audio', '24 bit audio',
    'balanced xlr', 'unbalanced rca', 'balanced trs',
    'stereo amplifier', 'mono amplifier', 'bridgeable amplifier',
    'turntable', 'record player', 'phono cartridge', 'stylus',
    'mm cartridge', 'mc cartridge', 'moving magnet', 'moving coil',

    // ── Window film / Tint ────────────────────────────────────────────────────
    '5% vlt', '15% vlt', '20% vlt', '35% vlt', '50% vlt', '70% vlt',
    'uv rejection 99%', 'ir rejection', 'heat rejection',
    'ceramic tint', 'carbon tint', 'dyed tint', 'metallic tint',
    'frosted film', 'privacy film', 'one way mirror film',
    'self adhesive film', 'static cling film', 'non adhesive film',

    // ── Vintage / Antique ────────────────────────────────────────────────────
    'circa 1900', 'circa 1920', 'circa 1950', 'circa 1960', 'circa 1970', 'circa 1980',
    'victorian era', 'edwardian era', 'georgian era', 'art deco period', 'art nouveau',
    'mid century modern', 'post war', 'pre war', 'inter war',
    '19th century', '20th century', '18th century',
    '1900s', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s',

    // ── Printer / Ink specs ───────────────────────────────────────────────────
    'oem cartridge', 'compatible cartridge', 'remanufactured cartridge',
    'xl cartridge', 'xxl cartridge', 'high yield cartridge', 'standard yield',
    'black ink', 'cyan ink', 'magenta ink', 'yellow ink', 'colour ink',
    'page yield 200', 'page yield 500', 'page yield 1000', 'page yield 2000',
    'page yield 3000', 'page yield 4000', 'page yield 5000',
    'glossy photo paper', 'matte photo paper', 'silk photo paper',
    'heavyweight paper', 'standard paper', 'premium paper',
    'thermal label', 'self adhesive label', 'address label',
    'a4 labels', 'a5 labels', 'a6 labels',

    // ── Fabric by the meter ───────────────────────────────────────────────────
    'per metre', 'per meter', 'per yard', 'by the metre', 'by the meter',
    'half metre', 'quarter metre', '1 metre', '2 metre', '5 metre',
    'upholstery fabric', 'curtain fabric', 'furnishing fabric',
    'dress fabric', 'craft fabric', 'quilting fabric',
    'plain weave', 'twill weave', 'satin weave', 'jacquard weave',

    // ── Alcohol / Drinks ──────────────────────────────────────────────────────
    'single malt whisky', 'blended whisky', 'blended malt', 'grain whisky',
    'scotch whisky', 'irish whiskey', 'bourbon whiskey', 'rye whiskey',
    '10 year old', '12 year old', '15 year old', '18 year old', '21 year old', '25 year old',
    'aged 10 years', 'aged 12 years', 'aged 18 years',
    '40% abv', '43% abv', '46% abv', '50% abv', '57% abv',
    'cask strength', 'barrel strength', 'natural cask strength',
    'non chill filtered', 'chill filtered', 'natural colour',
    'first fill bourbon', 'ex bourbon cask', 'ex sherry cask', 'ex wine cask',
    'white wine', 'red wine', 'rose wine', 'sparkling wine', 'prosecco', 'champagne',
    '75cl bottle', '70cl bottle', '1 litre bottle', '1.5 litre bottle',

    // ── Epoxy / Resin specs ───────────────────────────────────────────────────
    'two part epoxy', 'two component', 'part a part b',
    '5 minute cure', '10 minute cure', '24 hour cure', '72 hour cure',
    'pot life 10min', 'pot life 30min', 'pot life 60min',
    'uv resistant resin', 'food safe resin', 'marine epoxy', 'structural epoxy',
    'low viscosity', 'medium viscosity', 'high viscosity',
    'casting resin', 'coating resin', 'laminating resin', 'infusion resin',

    // ── Motorcycle specs ─────────────────────────────────────────────────────
    'ece 22.06', 'ece 22.05', 'ece r22.06', 'dot approved helmet', 'snell certified',
    'full face helmet', 'open face helmet', 'modular helmet', 'half helmet', 'motocross helmet',
    'acu gold', 'acu silver', 'fia certified', 'racing helmet',
    'motorcycle glove', 'gauntlet glove', 'summer glove', 'winter glove',
    'motorcycle jacket', 'textile jacket', 'leather motorcycle jacket',
    'motorcycle boot', 'short boot', 'tall boot', 'sport boot', 'touring boot',
    'ce level 1 armour', 'ce level 2 armour', 'en 13634', 'en 13595', 'en 17092',

    // ── Pool / Spa specs ─────────────────────────────────────────────────────
    '2 person hot tub', '4 person hot tub', '6 person hot tub', '8 person hot tub',
    'inflatable hot tub', 'rigid hot tub', 'swim spa',
    '1000 litre pool', '2000 litre pool', '3000 litre pool',
    'above ground pool', 'inflatable pool', 'paddling pool',
    '200g chlorine tablet', '25kg chlorine', '5kg chlorine',
    'slow release tablet', 'fast dissolving tablet',
    'pool shock treatment', 'non chlorine shock',
    'algaecide', 'clarifier', 'flocculant', 'pool stabiliser', 'cyanuric acid',
    'filter pump 1000lph', 'filter pump 2000lph', 'filter pump 3000lph',

    // ── Digital products / subscriptions ─────────────────────────────────────
    'windows 11 key', 'windows 10 key', 'office 365 key', 'microsoft office key',
    'antivirus 1 year', 'antivirus 2 year', 'antivirus 3 year',
    'vpn 1 year', 'vpn 2 year', 'vpn lifetime',
    '1 month subscription', '3 month subscription', '6 month subscription',
    '1 year subscription', '2 year subscription', 'lifetime subscription',
    'instant delivery', 'email delivery', 'digital download',
    'region free key', 'global key', 'eu region key', 'us region key', 'uk region key',

    // ── Costume / Fancy dress ────────────────────────────────────────────────
    'halloween costume', 'fancy dress costume', 'cosplay costume',
    'adult costume', 'kids costume', 'child costume', 'toddler costume',
    'superhero costume', 'princess costume', 'pirate costume', 'witch costume',
    'vampire costume', 'zombie costume', 'disney costume', 'marvel costume',
    'complete costume', 'costume set', 'with accessories',
    'christmas jumper', 'christmas sweater', 'ugly sweater', 'festive jumper',

    // ── Sewing / Textile patterns ─────────────────────────────────────────────
    'sewing pattern', 'knitting pattern', 'crochet pattern', 'cross stitch pattern',
    'size 8 pattern', 'size 10 pattern', 'size 12 pattern', 'size 14 pattern',
    'size 16 pattern', 'size 18 pattern', 'size 20 pattern',
    'uk size 8', 'uk size 10', 'uk size 12', 'uk size 14', 'uk size 16',
    'simplicity pattern', 'mccalls pattern', 'butterick pattern', 'vogue pattern',
    'burda pattern',

    // ── Security camera / Smart home ─────────────────────────────────────────
    '1080p camera', '2mp camera', '4mp camera', '5mp camera', '8mp camera',
    '4k camera security', '1080p cctv', '2k security camera',
    '30m night vision', '20m night vision', '10m night vision',
    '360 degree view', '180 degree view', '90 degree view',
    'pir sensor', 'passive infrared', 'motion detection', 'two way audio',
    'weatherproof ip65', 'weatherproof ip66', 'weatherproof ip67',
    'wired poe', 'wireless wifi', '4g security camera',
    'facial recognition', 'person detection', 'vehicle detection',
    'compatible alexa', 'compatible google', 'homekit compatible',
    'zigbee hub', 'z-wave hub', 'matter compatible', 'thread compatible',
    '433mhz sensor', '868mhz sensor',

    // ── Craft / Model making ─────────────────────────────────────────────────
    '1:72 scale', '1:48 scale', '1:35 scale', '1:32 scale', '1:24 scale',
    '1:18 scale model', '1:43 scale', '1:76 scale',
    'airfix model', 'tamiya model', 'revell model', 'hasegawa model',
    'enamel paint', 'acrylic model paint', 'lacquer paint',
    'weathering powder', 'wash paint', 'chipping fluid',

    // ── Outdoor power equipment ───────────────────────────────────────────────
    '20v battery', '40v battery', '56v battery', '80v battery',
    '2ah battery tool', '4ah battery tool', '5ah battery tool', '6ah battery tool',
    'brushless motor tool', 'brushed motor tool',
    '18v compatible', '20v max', '40v max',
    'cordless drill', 'cordless saw', 'cordless sander',
    'amp hour 2.0', 'amp hour 4.0', 'amp hour 5.0', 'amp hour 6.0',

    // ── Photography extras ────────────────────────────────────────────────────
    'full frame sensor', 'crop sensor', 'aps-c sensor', 'micro four thirds',
    'mechanical shutter', 'electronic shutter', 'global shutter',
    'in body stabilisation', 'ibis', '5 axis stabilisation', 'optical stabilisation',
    'dual card slot', 'single card slot', 'cfexpress', 'xqd card', 'sd card slot',
    'weather sealed', 'dust sealed', 'splash proof', 'fully weather sealed',
    'silent shooting', 'silent shutter',
    'eye tracking af', 'animal eye af', 'bird eye af', 'real time tracking',

])

// ── Spec word classifier ──────────────────────────────────────────────────────
// Main function: determines if a word or phrase is a spec
// Returns the spec type if it is, null if it isn't
export function isSpecWord(word: string): string | null {
    const wl = word.toLowerCase().trim()

    // 1. Check fixed spec words first (exact match)
    if (FIXED_SPEC_WORDS.has(wl)) return 'fixed-spec'

    // 2. Check pattern-based specs
    for (const sp of SPEC_PATTERNS) {
        if (sp.pattern.test(word.trim())) return sp.type
    }

    // 3. Pure number = spec (measurements, model numbers, years)
    if (/^\d+$/.test(word.trim())) return 'number'

    // 4. Alphanumeric codes = model numbers (e.g. A1234B, XB500)
    if (/^[A-Z0-9]{3,}$/i.test(word.trim()) && /\d/.test(word) && /[A-Z]/i.test(word)) return 'model-code'

    return null
}

// ── Multi-word spec detector ──────────────────────────────────────────────────
// Detects specs that span multiple words e.g. "Bluetooth 5.3", "64 GB", "Size 10 UK"
export function findSpecsInTitle(title: string): { spec: string; type: string; start: number; end: number }[] {
    const found: { spec: string; type: string; start: number; end: number }[] = []
    const words = title.split(/\s+/)
    let i = 0

    while (i < words.length) {
        // Try 3-word combo first
        if (i + 2 < words.length) {
            const three = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
            const threeType = isSpecWord(three)
            if (threeType) {
                found.push({ spec: three, type: threeType, start: i, end: i + 2 })
                i += 3; continue
            }
        }
        // Try 2-word combo
        if (i + 1 < words.length) {
            const two = `${words[i]} ${words[i + 1]}`
            const twoType = isSpecWord(two)
            if (twoType) {
                found.push({ spec: two, type: twoType, start: i, end: i + 1 })
                i += 2; continue
            }
        }
        // Try single word
        const oneType = isSpecWord(words[i])
        if (oneType) {
            found.push({ spec: words[i], type: oneType, start: i, end: i })
        }
        i++
    }

    return found
}

// ── Get all specs from a title as a Set of words ─────────────────────────────
// Returns a Set of word indices that are specs — engine locks these
export function getSpecWordIndices(title: string): Set<number> {
    const locked = new Set<number>()
    const specs = findSpecsInTitle(title)
    for (const s of specs) {
        for (let i = s.start; i <= s.end; i++) locked.add(i)
    }
    return locked
}

// ── Classify all words in a title ────────────────────────────────────────────
// Returns array of { word, isSpec, specType } for every word
export function classifyTitleWords(title: string): {
    word: string
    index: number
    isSpec: boolean
    specType: string | null
}[] {
    const words = title.split(/\s+/)
    const locked = getSpecWordIndices(title)
    const specs = findSpecsInTitle(title)

    // Build spec type map
    const specTypes = new Map<number, string>()
    for (const s of specs) {
        for (let i = s.start; i <= s.end; i++) specTypes.set(i, s.type)
    }

    return words.map((word, index) => ({
        word,
        index,
        isSpec: locked.has(index),
        specType: specTypes.get(index) ?? null,
    }))
}
