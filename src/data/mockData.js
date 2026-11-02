// Base de Datos Especializada para Tienda de Repuestos de Motos y Autopartes
// Enfocado en el mercado venezolano: Bera, Empire Keeway, Toro, MD Haojin, Suzuki, Yamaha, Honda
// Incluye línea automotriz (Aceites para carros, refrigerantes, bujías y fluidos)

export const INITIAL_SETTINGS = {
  storeName: "B&G Multiservicios",
  legalName: "B&G Multiservicios C.A.",
  taxId: "J-31084920-5",
  phone: "+58 412 555-4321",
  whatsapp: "+58 414 789-1234",
  email: "contacto@bgmultiservicios.com",
  address: "Av. Principal, Local B&G Multiservicios",
  currencySymbol: "$",
  currencyCode: "USD",
  taxRate: 16, // %
  ticketFooter: "¡Garantía de 30 días en repuestos mecánicos! Partes eléctricas no tienen cambio ni devolución. Guarde este ticket.",
  logoUrl: "/logo.jpg"
};

export const VEHICLE_DATABASE = [
  // ==================== MOTOS (ESPECIALIDAD VENEZUELA) ====================
  {
    type: "moto",
    make: "Bera",
    models: [
      { name: "SBR 150 (Caballito)", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026], engines: ["150cc Varillero CG"] },
      { name: "BWS 150 Scooter", years: [2015, 2018, 2020, 2022, 2024], engines: ["150cc GY6 Automático"] },
      { name: "Socialista 150 (BR-150)", years: [2012, 2014, 2016, 2018, 2020], engines: ["150cc Varillero CG"] },
      { name: "León 150", years: [2019, 2021, 2023, 2025], engines: ["150cc Varillero"] },
      { name: "Merú 150", years: [2018, 2020, 2022, 2024], engines: ["150cc Cadenero CB"] },
      { name: "Kaua 150", years: [2021, 2022, 2023, 2024], engines: ["150cc Varillero"] },
      { name: "BR-200 Enduro", years: [2016, 2018, 2020, 2022, 2024], engines: ["200cc Varillero con Balanceador"] }
    ]
  },
  {
    type: "moto",
    make: "Empire Keeway",
    models: [
      { name: "Horse 150 (I y II)", years: [2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024], engines: ["150cc Varillero CG"] },
      { name: "Owen 150", years: [2010, 2012, 2014, 2016, 2018, 2020, 2022], engines: ["150cc Varillero CG"] },
      { name: "Arsen 150", years: [2011, 2013, 2015, 2017, 2019, 2021], engines: ["150cc Varillero CG"] },
      { name: "RKV 200", years: [2013, 2015, 2017, 2019, 2021, 2023], engines: ["200cc Cadenero con Radiador de Aceite"] },
      { name: "TX 200 Enduro", years: [2012, 2014, 2016, 2018, 2020, 2022], engines: ["200cc Cadenero"] },
      { name: "Outlook 150 Scooter", years: [2010, 2012, 2014, 2016, 2018], engines: ["150cc 4V Refrigerado por Líquido"] },
      { name: "Express 150", years: [2021, 2022, 2023, 2024], engines: ["150cc Varillero"] }
    ]
  },
  {
    type: "moto",
    make: "Toro Motorcycles",
    models: [
      { name: "TR-150", years: [2022, 2023, 2024, 2025, 2026], engines: ["150cc Motor Varillero CG con Balanceador"] },
      { name: "León 150", years: [2022, 2023, 2024, 2025], engines: ["150cc Varillero"] },
      { name: "Rex 250", years: [2023, 2024, 2025, 2026], engines: ["250cc Cadenero Refrigerado por Aceite"] }
    ]
  },
  {
    type: "moto",
    make: "MD Haojin",
    models: [
      { name: "Águila 150 (HJ-150)", years: [2012, 2014, 2016, 2018, 2020, 2022, 2024], engines: ["150cc Varillero CG"] },
      { name: "Cóndor 150", years: [2013, 2015, 2017, 2019, 2021], engines: ["150cc Varillero CG"] },
      { name: "Lechuza 200", years: [2014, 2016, 2018, 2020, 2022], engines: ["200cc Varillero"] },
      { name: "Cardenal 150", years: [2015, 2017, 2019, 2021], engines: ["150cc Varillero"] }
    ]
  },
  {
    type: "moto",
    make: "Suzuki",
    models: [
      { name: "GN 125", years: [2005, 2008, 2010, 2012, 2015, 2018, 2021, 2024], engines: ["125cc Cadenero SOHC"] },
      { name: "EN 125 2A", years: [2008, 2011, 2014, 2017, 2020], engines: ["125cc SOHC"] },
      { name: "AX 100 (2 Tiempos)", years: [2000, 2005, 2008, 2012, 2015, 2018], engines: ["100cc 2 Tiempos"] }
    ]
  },
  {
    type: "moto",
    make: "Yamaha",
    models: [
      { name: "YBR 125 / ED", years: [2008, 2011, 2014, 2017, 2020, 2023], engines: ["125cc 4 Tiempos"] },
      { name: "DT 125 / 175 (2T)", years: [1995, 2000, 2005, 2008], engines: ["125cc / 175cc 2T"] },
      { name: "FZ 16 / 2.0", years: [2012, 2015, 2018, 2021, 2024], engines: ["150cc / 160cc Blue Core"] }
    ]
  },
  {
    type: "moto",
    make: "Honda",
    models: [
      { name: "CG 125 / Titan", years: [2000, 2005, 2008, 2012, 2015], engines: ["125cc Varillero / Cadenero"] },
      { name: "XR 150L", years: [2015, 2018, 2021, 2024], engines: ["150cc OHC"] },
      { name: "Storm 125", years: [2008, 2011, 2014, 2016], engines: ["125cc Varillero"] }
    ]
  },

  // ==================== CARROS (LÍNEA AUTOMOTRIZ DE ACEITES Y FLUIDOS) ====================
  {
    type: "car",
    make: "Toyota",
    models: [
      { name: "Corolla", years: [2008, 2012, 2016, 2020, 2022], engines: ["1.8L Dual VVT-i"] },
      { name: "Hilux / Fortuner", years: [2010, 2014, 2018, 2022, 2024], engines: ["2.7L Gasolina 2TR-FE", "4.0L V6"] },
      { name: "Yaris", years: [2006, 2009, 2012, 2016], engines: ["1.3L / 1.5L"] }
    ]
  },
  {
    type: "car",
    make: "Chevrolet",
    models: [
      { name: "Aveo", years: [2005, 2008, 2011, 2014, 2016], engines: ["1.6L 16V DOHC"] },
      { name: "Optra", years: [2006, 2008, 2010, 2012], engines: ["1.8L Design / Limited"] },
      { name: "Spark", years: [2007, 2010, 2013, 2015], engines: ["1.0L 4 Cil"] },
      { name: "Silverado", years: [2008, 2011, 2014, 2018], engines: ["5.3L V8 Vortec"] }
    ]
  },
  {
    type: "car",
    make: "Ford",
    models: [
      { name: "Fiesta Power / Move / Max", years: [2005, 2008, 2011, 2013], engines: ["1.6L Zetec Rocam"] },
      { name: "EcoSport", years: [2006, 2009, 2012, 2015], engines: ["2.0L Duratec"] }
    ]
  }
];

export const CATEGORIES = [
  { id: "arrastre", name: "Kits de Arrastre y Cadenas", icon: "Layers", type: "moto" },
  { id: "motor_moto", name: "Cilindros y Motor Moto", icon: "Cog", type: "moto" },
  { id: "frenos", name: "Frenos (Pastillas y Bandas)", icon: "Disc", type: "ambos" },
  { id: "electrico", name: "CDI, Reguladores y Baterías", icon: "Zap", type: "moto" },
  { id: "aceites_moto", name: "Aceites y Lubricantes para Motos (4T)", icon: "Droplet", type: "moto" },
  { id: "aceites_carro", name: "Aceites para Motor de Carro", icon: "Droplet", type: "car" },
  { id: "carburacion", name: "Carburadores y Filtros", icon: "Wind", type: "moto" },
  { id: "suspension_guayas", name: "Barras, Amortiguadores y Guayas", icon: "Activity", type: "moto" },
  { id: "fluidos_carro", name: "Refrigerantes y Fluidos de Carro", icon: "Droplet", type: "car" }
];

export const DEMO_PARTS = [
  // ==================== REPUESTOS DE MOTOS (MERCADO VENEZOLANO) ====================
  {
    id: "part-moto-001",
    vehicleType: "moto",
    sku: "KA-428H-BERA",
    oemNumber: "KA-428H-118L",
    barcode: "759102938101",
    name: "Kit de Arrastre Reforzado 428H Dorado (Corona 38T - Piñón 14T)",
    brand: "DID / Choho",
    image: "/products/kit_arrastre.jpg",
    category: "arrastre",
    description: "Kit de arrastre de alta resistencia para trabajo diario en mototaxi y repartos. Cadena 428H con eslabón reforzado.",
    costPrice: 8.50,
    salePrice: 15.00,
    wholesalePrice: 12.50,
    stock: 24,
    minStock: 8,
    location: "Estante Motos A - Gaveta 03",
    warranty: "Garantía de instalación",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "MD Haojin", model: "Águila 150 (HJ-150)", yearStart: 2012, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" }
    ],
    status: "ok"
  },
  {
    id: "part-moto-002",
    vehicleType: "moto",
    sku: "CIL-CG150-STD",
    oemNumber: "157FMI-CIL-KIT",
    barcode: "759201948202",
    name: "Kit de Cilindro Completo 150cc Estándar (Cilindro, Pistón, Anillos, Pasador y Empacaduras)",
    brand: "Goyo Racing / Shineray",
    image: "/products/cilindro_150.jpg",
    category: "motor_moto",
    description: "Cilindro estándar 62mm de aleación con pistón rectificado y aros de cromo. Compatible con motores varilleros 150cc.",
    costPrice: 18.00,
    salePrice: 32.00,
    wholesalePrice: 27.00,
    stock: 12,
    minStock: 4,
    location: "Pasillo Central - Est. Cilindros 2",
    warranty: "Garantía por compresión de fábrica",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Bera", model: "Socialista 150 (BR-150)", yearStart: 2012, yearEnd: 2020, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "MD Haojin", model: "Águila 150 (HJ-150)", yearStart: 2012, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" }
    ],
    status: "ok"
  },
  {
    id: "part-moto-003",
    vehicleType: "moto",
    sku: "PF-MOTO-DISC",
    oemNumber: "PF-GN-SBR-DEL",
    barcode: "759302847103",
    name: "Pastillas de Freno Delanteras Disco para Moto (Semi-metálicas)",
    brand: "Brembo Racing / ProX",
    image: "/products/pastillas_freno.jpg",
    category: "frenos",
    description: "Pastillas de freno de alto agarre con ranura de drenaje y disipador de temperatura para frenado seguro en lluvia y sol.",
    costPrice: 1.80,
    salePrice: 4.50,
    wholesalePrice: 3.50,
    stock: 45,
    minStock: 15,
    location: "Mostrador 1 - Gaveta Frenos 04",
    warranty: "Garantía de agarre",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "Suzuki", model: "GN 125", yearStart: 2005, yearEnd: 2024, engine: "125cc Cadenero SOHC" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" }
    ],
    status: "ok"
  },
  {
    id: "part-moto-004",
    vehicleType: "moto",
    sku: "BF-MOTO-TRAS",
    oemNumber: "BF-CG150-130",
    barcode: "759403928104",
    name: "Bandas de Freno Traseras (Zapatas de Tambor) con Resortes",
    brand: "Kasinski / Federal Mogul",
    image: "/products/bandas_tambor.jpg",
    category: "frenos",
    description: "Juego de bandas traseras para tambor de 130mm. Material de fricción ecológico sin asbesto de gran durabilidad.",
    costPrice: 2.20,
    salePrice: 5.00,
    wholesalePrice: 4.00,
    stock: 35,
    minStock: 12,
    location: "Mostrador 1 - Gaveta Frenos 05",
    warranty: "Garantía de fábrica",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "MD Haojin", model: "Águila 150 (HJ-150)", yearStart: 2012, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" }
    ],
    status: "ok"
  },
  {
    id: "part-moto-005",
    vehicleType: "moto",
    sku: "CDI-RACING-6P",
    oemNumber: "CDI-DC-6PIN-RACE",
    barcode: "759504839105",
    name: "CDI Racing 6 Pines Corriente Directa (Sin Límite de RPM)",
    brand: "Orange Power Racing",
    image: "/products/cdi_racing.jpg",
    category: "electrico",
    description: "Módulo CDI de encendido electrónico deslimitado. Optimiza el avance de chispa y mejora la aceleración en altas revoluciones.",
    costPrice: 4.50,
    salePrice: 9.00,
    wholesalePrice: 7.50,
    stock: 18,
    minStock: 6,
    location: "Estante Eléctrico - Gaveta 01",
    warranty: "Probado en banco antes de entregar",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" }
    ],
    status: "ok"
  },
  {
    id: "part-moto-006",
    vehicleType: "moto",
    sku: "REG-5C-KEEWAY",
    oemNumber: "REG-12V-5C-CG",
    barcode: "759605928106",
    name: "Regulador / Rectificador de Voltaje 12V 5 Cables con Disipador",
    brand: "Mitsuba",
    image: "/products/cdi_racing.jpg",
    category: "electrico",
    description: "Regulador de corriente con aletas de aluminio refrigeradas. Protege el sistema de sobrecargas y cuida la batería.",
    costPrice: 3.50,
    salePrice: 7.50,
    wholesalePrice: 6.00,
    stock: 2, // ALERTA: Stock bajo
    minStock: 5,
    location: "Estante Eléctrico - Gaveta 03",
    warranty: "Probado en banco de prueba",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "MD Haojin", model: "Águila 150 (HJ-150)", yearStart: 2012, yearEnd: 2024, engine: "150cc Varillero CG" }
    ],
    status: "low"
  },
  {
    id: "part-moto-007",
    vehicleType: "moto",
    sku: "BAT-GEL-12V7A",
    oemNumber: "YTX7A-BS-GEL",
    barcode: "759706839107",
    name: "Batería de Gel 12V 7Ah con Indicador Digital de Carga",
    brand: "Outdo / YTX",
    image: "/products/bateria_gel.jpg",
    category: "electrico",
    description: "Batería sellada libre de mantenimiento con pantalla voltímetro LED integrada. Gran amperaje de arranque en frío.",
    costPrice: 14.00,
    salePrice: 24.00,
    wholesalePrice: 20.00,
    stock: 8,
    minStock: 4,
    location: "Mostrador Base - Est. Baterías",
    warranty: "3 Meses de garantía",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Bera", model: "BWS 150 Scooter", yearStart: 2015, yearEnd: 2024, engine: "150cc GY6 Automático" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" }
    ],
    status: "ok"
  },
  {
    id: "part-moto-008",
    vehicleType: "moto",
    sku: "CARB-PZ27-SBR",
    oemNumber: "PZ27-150CC-MAN",
    barcode: "759807928108",
    name: "Carburador PZ27 con Ahogador Manual para Motor 150cc",
    brand: "Keihin Japón Style",
    image: "/products/carburador_pz27.jpg",
    category: "carburacion",
    description: "Carburador de alta precisión y mínimo consumo de gasolina. Cortina cromada y chicleres de calibración exacta.",
    costPrice: 11.00,
    salePrice: 20.00,
    wholesalePrice: 17.00,
    stock: 0, // AGOTADO
    minStock: 4,
    location: "Estante Carburadores - Gaveta 02",
    warranty: "Garantía de afinación",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "MD Haojin", model: "Águila 150 (HJ-150)", yearStart: 2012, yearEnd: 2024, engine: "150cc Varillero CG" }
    ],
    status: "out"
  },
  {
    id: "part-moto-009",
    vehicleType: "moto",
    sku: "AC-MOTUL-20W50",
    oemNumber: "MOTUL-3000-4T",
    barcode: "3374650004928",
    name: "Aceite 4T 20W-50 Mineral Motul 3000 con Ester (Litro)",
    brand: "Motul",
    image: "/products/aceite_galon.jpg",
    category: "aceites_moto",
    description: "Lubricante mineral reforzado con aditivos extrema presión para embragues húmedos JASO MA2 y API SL.",
    costPrice: 5.20,
    salePrice: 8.50,
    wholesalePrice: 7.20,
    stock: 36,
    minStock: 12,
    location: "Pasillo Aceites - Est. Motos",
    warranty: "100% Original Sellado",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" },
      { make: "Suzuki", model: "GN 125", yearStart: 2005, yearEnd: 2024, engine: "125cc Cadenero SOHC" }
    ],
    status: "ok"
  },
  {
    id: "part-moto-010",
    vehicleType: "moto",
    sku: "AMORT-SBR-DOBLE",
    oemNumber: "AM-330MM-SBR",
    barcode: "759908829110",
    name: "Par de Amortiguadores Traseros Reforzados a Gas / Aceite (330mm)",
    brand: "Yamamoto / ProShock",
    image: "/products/amortiguadores_moto.jpg",
    category: "suspension_guayas",
    description: "Juego de amortiguadores reforzados con espiral grueso para soportar peso y carga en calles irregulares.",
    costPrice: 15.00,
    salePrice: 28.00,
    wholesalePrice: 24.00,
    stock: 3, // ALERTA: Stock bajo
    minStock: 6,
    location: "Pasillo Suspensión - Nivel Piso",
    warranty: "6 Meses de garantía",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" }
    ],
    status: "low"
  },
  {
    id: "part-moto-011",
    vehicleType: "moto",
    sku: "BUJ-NGK-D8EA",
    oemNumber: "NGK-D8EA-STD",
    barcode: "087295121208",
    name: "Bujía NGK D8EA para Moto 150cc / 200cc (Rosca Larga)",
    brand: "NGK Japón",
    image: "/products/bujia_ngk.jpg",
    category: "motor_moto",
    description: "Bujía estándar original de electrodo de cobre para motores 4T monocilíndricos varilleros y cadeneros.",
    costPrice: 1.10,
    salePrice: 2.50,
    wholesalePrice: 2.00,
    stock: 50,
    minStock: 20,
    location: "Mostrador 1 - Gaveta Bujías 01",
    warranty: "Original certificada",
    compatibleVehicles: [
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Horse 150 (I y II)", yearStart: 2008, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Empire Keeway", model: "Owen 150", yearStart: 2010, yearEnd: 2022, engine: "150cc Varillero CG" },
      { make: "MD Haojin", model: "Águila 150 (HJ-150)", yearStart: 2012, yearEnd: 2024, engine: "150cc Varillero CG" },
      { make: "Toro Motorcycles", model: "TR-150", yearStart: 2022, yearEnd: 2026, engine: "150cc Motor Varillero CG" }
    ],
    status: "ok"
  },

  // ==================== LÍNEA AUTOMOTRIZ (ACEITES Y FLUIDOS PARA CARROS) ====================
  {
    id: "part-car-001",
    vehicleType: "car",
    sku: "AC-SHELL-20W50-GAL",
    oemNumber: "SHELL-HX5-20W50",
    barcode: "5011987249102",
    name: "Aceite de Motor para Carro 20W-50 Mineral Shell Helix HX5 (Galón 4L)",
    brand: "Shell Helix",
    image: "/products/aceite_galon.jpg",
    category: "aceites_carro",
    description: "Aceite mineral premium para motores a gasolina con tecnología de limpieza activa contra lodos y depósitos.",
    costPrice: 16.50,
    salePrice: 26.00,
    wholesalePrice: 22.50,
    stock: 14,
    minStock: 5,
    location: "Pasillo Carros - Est. Galones 1",
    warranty: "Sellado de fábrica con precinto",
    compatibleVehicles: [
      { make: "Chevrolet", model: "Aveo", yearStart: 2005, yearEnd: 2016, engine: "1.6L 16V DOHC" },
      { make: "Chevrolet", model: "Optra", yearStart: 2006, yearEnd: 2012, engine: "1.8L Design / Limited" },
      { make: "Chevrolet", model: "Spark", yearStart: 2007, yearEnd: 2015, engine: "1.0L 4 Cil" },
      { make: "Ford", model: "Fiesta Power / Move / Max", yearStart: 2005, yearEnd: 2013, engine: "1.6L Zetec Rocam" },
      { make: "Toyota", model: "Corolla", yearStart: 2008, yearEnd: 2016, engine: "1.8L Dual VVT-i" }
    ],
    status: "ok"
  },
  {
    id: "part-car-002",
    vehicleType: "car",
    sku: "AC-CASTROL-15W40",
    oemNumber: "GTX-15W40-SEMI",
    barcode: "079172401821",
    name: "Aceite Semi-Sintético para Carro 15W-40 Castrol GTX Anti-Lodo (Galón)",
    brand: "Castrol GTX",
    image: "/products/aceite_galon.jpg",
    category: "aceites_carro",
    description: "Fórmula de doble acción que limpia el lodo existente y protege contra la formación de nuevos depósitos en motores modernos.",
    costPrice: 19.00,
    salePrice: 30.00,
    wholesalePrice: 26.00,
    stock: 9,
    minStock: 4,
    location: "Pasillo Carros - Est. Galones 2",
    warranty: "Sellado de fábrica",
    compatibleVehicles: [
      { make: "Toyota", model: "Corolla", yearStart: 2008, yearEnd: 2022, engine: "1.8L Dual VVT-i" },
      { make: "Toyota", model: "Hilux / Fortuner", yearStart: 2010, yearEnd: 2024, engine: "2.7L Gasolina 2TR-FE" },
      { make: "Chevrolet", model: "Aveo", yearStart: 2005, yearEnd: 2016, engine: "1.6L 16V DOHC" }
    ],
    status: "ok"
  },
  {
    id: "part-car-003",
    vehicleType: "car",
    sku: "AC-PDV-20W50-LITRO",
    oemNumber: "PDV-EXTRA-MULT-L",
    barcode: "759100293019",
    name: "Aceite para Motor Carro 20W-50 Extra Multigrado PDV (Litro)",
    brand: "PDV (Nacional)",
    image: "/products/aceite_galon.jpg",
    category: "aceites_carro",
    description: "Lubricante de base parafínica de alta calidad para motores de gasolina sometidos a temperaturas elevadas.",
    costPrice: 3.20,
    salePrice: 5.50,
    wholesalePrice: 4.80,
    stock: 28,
    minStock: 10,
    location: "Pasillo Carros - Nivel 2",
    warranty: "Sellado",
    compatibleVehicles: [
      { make: "Chevrolet", model: "Aveo", yearStart: 2005, yearEnd: 2016, engine: "1.6L 16V DOHC" },
      { make: "Chevrolet", model: "Silverado", yearStart: 2008, yearEnd: 2018, engine: "5.3L V8 Vortec" },
      { make: "Ford", model: "Fiesta Power / Move / Max", yearStart: 2005, yearEnd: 2013, engine: "1.6L Zetec Rocam" }
    ],
    status: "ok"
  },
  {
    id: "part-car-004",
    vehicleType: "car",
    sku: "REF-PRESTONE-5050",
    oemNumber: "PRESTONE-AF2100",
    barcode: "079749210041",
    name: "Refrigerante / Coolant Radiador 50/50 Larga Duración Prestone (Galón)",
    brand: "Prestone",
    image: "/products/refrigerante_galon.jpg",
    category: "fluidos_carro",
    description: "Refrigerante listo para usar prediluido 50/50. Protección contra corrosión y sobrecalentamiento hasta por 5 años o 240.000 Km.",
    costPrice: 8.50,
    salePrice: 14.50,
    wholesalePrice: 12.50,
    stock: 11,
    minStock: 4,
    location: "Pasillo Fluidos - Est. 1",
    warranty: "Calidad original certificada",
    compatibleVehicles: [
      { make: "Toyota", model: "Corolla", yearStart: 2008, yearEnd: 2022, engine: "1.8L Dual VVT-i" },
      { make: "Toyota", model: "Hilux / Fortuner", yearStart: 2010, yearEnd: 2024, engine: "2.7L Gasolina 2TR-FE" },
      { make: "Chevrolet", model: "Aveo", yearStart: 2005, yearEnd: 2016, engine: "1.6L 16V DOHC" },
      { make: "Chevrolet", model: "Optra", yearStart: 2006, yearEnd: 2012, engine: "1.8L Design / Limited" }
    ],
    status: "ok"
  },
  {
    id: "part-car-005",
    vehicleType: "car",
    sku: "LIQ-FRENOS-DOT4",
    oemNumber: "WURTH-DOT4-500",
    barcode: "4045727192014",
    name: "Líquido de Frenos Sintético DOT 4 de Alto Punto de Ebullición (500ml)",
    brand: "Wurth / Wagner",
    image: "/products/refrigerante_galon.jpg",
    category: "fluidos_carro",
    description: "Fluido hidráulico de frenos de máxima seguridad. Punto de ebullición húmedo superior a 165°C. Apto para motos y carros con ABS.",
    costPrice: 2.80,
    salePrice: 5.50,
    wholesalePrice: 4.50,
    stock: 22,
    minStock: 8,
    location: "Pasillo Fluidos - Est. 2",
    warranty: "Envase sellado",
    compatibleVehicles: [
      { make: "Toyota", model: "Corolla", yearStart: 2008, yearEnd: 2022, engine: "1.8L Dual VVT-i" },
      { make: "Chevrolet", model: "Aveo", yearStart: 2005, yearEnd: 2016, engine: "1.6L 16V DOHC" },
      { make: "Bera", model: "SBR 150 (Caballito)", yearStart: 2018, yearEnd: 2026, engine: "150cc Varillero CG" }
    ],
    status: "ok"
  },
  {
    id: "part-car-006",
    vehicleType: "car",
    sku: "BUJ-NGK-BKR6E11",
    oemNumber: "BKR6E-11-STD",
    barcode: "087295127569",
    name: "Juego de 4 Bujías NGK Cobre para Carro (BKR6E-11)",
    brand: "NGK Japón",
    image: "/products/bujia_ngk.jpg",
    category: "fluidos_carro",
    description: "Juego de 4 bujías originales japonesas para motores Chevrolet Aveo, Optra 1.8, Toyota Yaris y Corolla.",
    costPrice: 6.80,
    salePrice: 13.00,
    wholesalePrice: 10.50,
    stock: 7,
    minStock: 4,
    location: "Pasillo Carros - Gaveta Bujías Carro",
    warranty: "100% Original en caja",
    compatibleVehicles: [
      { make: "Toyota", model: "Corolla", yearStart: 2008, yearEnd: 2016, engine: "1.8L Dual VVT-i" },
      { make: "Chevrolet", model: "Aveo", yearStart: 2005, yearEnd: 2016, engine: "1.6L 16V DOHC" },
      { make: "Chevrolet", model: "Optra", yearStart: 2006, yearEnd: 2012, engine: "1.8L Design / Limited" }
    ],
    status: "ok"
  }
];

export const INITIAL_PARTS = [];
export const INITIAL_SALES = [];

