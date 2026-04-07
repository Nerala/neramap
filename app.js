// ═══════════════════════════════════════════════════════════════
//  DATA — embedded fallback, backend-ready override hook
// ═══════════════════════════════════════════════════════════════
const EMBEDDED_LANGUAGES = [
  // ── Niger-Congo: Bantu ────────────────────────────────────────
  {
    id: 1,
    name: "Ewondo",
    iso: "ewo",
    lat: 3.85,
    lng: 11.5,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 800000,
    vitality: "stable",
    region: "Centre",
    description:
      "Langue des Beti du Centre-Sud, utilisée comme lingua franca régionale.",
  },
  {
    id: 2,
    name: "Bulu",
    iso: "bum",
    lat: 3.2,
    lng: 11.7,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 810000,
    vitality: "stable",
    region: "Sud",
    description: "Appartient au groupe Beti, proche de l'Ewondo et du Fang.",
  },
  {
    id: 3,
    name: "Fang",
    iso: "fan",
    lat: 2.3,
    lng: 10.8,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 450000,
    vitality: "stable",
    region: "Sud/Océan",
    description: "Parlé dans le sud profond et en Guinée Équatoriale/Gabon.",
  },
  {
    id: 4,
    name: "Bassa",
    iso: "bas",
    lat: 3.8,
    lng: 10.4,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 300000,
    vitality: "stable",
    region: "Littoral/Centre",
    description: "Langue du peuple Bassa, forte présence dans le Littoral.",
  },
  {
    id: 5,
    name: "Duala",
    iso: "dua",
    lat: 4.05,
    lng: 9.7,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 87000,
    vitality: "vulnerable",
    region: "Littoral",
    description: "Ancienne lingua franca commerciale du littoral camerounais.",
  },
  {
    id: 6,
    name: "Bafia",
    iso: "ksf",
    lat: 4.73,
    lng: 11.23,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 70000,
    vitality: "stable",
    region: "Centre",
    description: "Parlé dans le département du Mbam-et-Kim.",
  },
  {
    id: 7,
    name: "Basaa",
    iso: "bas",
    lat: 4.0,
    lng: 10.6,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 230000,
    vitality: "stable",
    region: "Centre/Littoral",
    description: "Groupe Bantu A du nord du Littoral.",
  },
  {
    id: 8,
    name: "Beti",
    iso: "bet",
    lat: 3.5,
    lng: 11.2,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 1500000,
    vitality: "stable",
    region: "Centre/Sud",
    description:
      "Regroupement de plusieurs dialectes Beti (Ewondo, Bulu, Fang, Eton).",
  },
  {
    id: 9,
    name: "Eton",
    iso: "eto",
    lat: 4.1,
    lng: 11.5,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 100000,
    vitality: "stable",
    region: "Centre",
    description: "Langue Beti parlée autour de Saa, au nord de Yaoundé.",
  },
  {
    id: 10,
    name: "Yemba (Dschang)",
    iso: "ybb",
    lat: 5.44,
    lng: 10.06,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 300000,
    vitality: "stable",
    region: "Ouest",
    description: "Langue bantoïde du département de la Menoua dans l'Ouest.",
  },
  {
    id: 11,
    name: "Ghomala' (Bamileke)",
    iso: "bbj",
    lat: 5.5,
    lng: 10.4,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 600000,
    vitality: "stable",
    region: "Ouest",
    description:
      "Langue des Bamiléké, très dynamique commercialement et culturellement.",
  },
  {
    id: 12,
    name: "Medumba",
    iso: "byv",
    lat: 5.03,
    lng: 10.31,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 300000,
    vitality: "stable",
    region: "Ouest",
    description: "Langue des Bangangté, parlée dans le Ndé.",
  },
  {
    id: 13,
    name: "Ngiemboon",
    iso: "nnh",
    lat: 5.55,
    lng: 10.2,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 180000,
    vitality: "stable",
    region: "Ouest",
    description: "Parlé à Baham et Batcham dans les Hautes-Terres de l'Ouest.",
  },
  {
    id: 14,
    name: "Fe'fe' (Bamileke)",
    iso: "fmp",
    lat: 5.62,
    lng: 10.52,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 250000,
    vitality: "stable",
    region: "Ouest",
    description: "Langue de Bafoussam, capitale régionale de l'Ouest.",
  },
  {
    id: 15,
    name: "Kom",
    iso: "bkm",
    lat: 6.1,
    lng: 10.1,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 100000,
    vitality: "stable",
    region: "Nord-Ouest",
    description: "Langue du Boyo, Nord-Ouest, lié au groupe Ngemba.",
  },
  {
    id: 16,
    name: "Lamnso' (Nso')",
    iso: "lns",
    lat: 6.2,
    lng: 10.65,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 200000,
    vitality: "stable",
    region: "Nord-Ouest",
    description: "Langue principale du Bui, important centre culturel Nso'.",
  },
  {
    id: 17,
    name: "Mankon (Ngemba)",
    iso: "mcu",
    lat: 5.95,
    lng: 10.17,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 80000,
    vitality: "stable",
    region: "Nord-Ouest",
    description: "Parlé à Bamenda, capitale du Nord-Ouest.",
  },
  {
    id: 18,
    name: "Bafut",
    iso: "bfd",
    lat: 6.1,
    lng: 10.11,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 60000,
    vitality: "stable",
    region: "Nord-Ouest",
    description:
      "Langue du chefferie Bafut, l'une des plus importantes du Nord-Ouest.",
  },
  {
    id: 19,
    name: "Aghem",
    iso: "agq",
    lat: 6.35,
    lng: 10.45,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 30000,
    vitality: "vulnerable",
    region: "Nord-Ouest",
    description: "Parlé dans le Wum, Menchum. Système tonal complexe.",
  },
  {
    id: 20,
    name: "Weh",
    iso: "weh",
    lat: 6.5,
    lng: 10.35,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 20000,
    vitality: "vulnerable",
    region: "Nord-Ouest",
    description: "Petite langue de la région de Menchum, proche de l'Aghem.",
  },
  {
    id: 21,
    name: "Mundani",
    iso: "mni",
    lat: 5.75,
    lng: 9.95,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 40000,
    vitality: "stable",
    region: "Sud-Ouest",
    description: "Parlé dans le Lebialem, partagé avec le Nigeria.",
  },
  {
    id: 22,
    name: "Bakweri (Mokpwe)",
    iso: "bss",
    lat: 4.1,
    lng: 9.23,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 60000,
    vitality: "vulnerable",
    region: "Sud-Ouest",
    description:
      "Peuple des contreforts du Mont Cameroun, fortement impacté par l'urbanisation.",
  },
  {
    id: 23,
    name: "Oroko",
    iso: "bok",
    lat: 4.7,
    lng: 9.25,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 80000,
    vitality: "stable",
    region: "Sud-Ouest",
    description: "Groupe de dialectes Bantu du Meme, Sud-Ouest.",
  },
  {
    id: 24,
    name: "Kenyang",
    iso: "ken",
    lat: 5.65,
    lng: 9.3,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 70000,
    vitality: "stable",
    region: "Sud-Ouest",
    description: "Lingua franca du Manyu, parlé aussi au Nigeria.",
  },
  {
    id: 25,
    name: "Ejagham (Ekoi)",
    iso: "etu",
    lat: 5.72,
    lng: 8.95,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 40000,
    vitality: "vulnerable",
    region: "Sud-Ouest",
    description: "Langue à écriture syllabique traditionnelle (Nsibidi).",
  },
  {
    id: 26,
    name: "Wimbum",
    iso: "wib",
    lat: 6.45,
    lng: 10.7,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 50000,
    vitality: "stable",
    region: "Nord-Ouest",
    description: "Parlé dans le Donga-Mantung, Nord-Ouest.",
  },
  {
    id: 27,
    name: "Limbum",
    iso: "lim",
    lat: 6.8,
    lng: 10.9,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 90000,
    vitality: "stable",
    region: "Nord-Ouest/Adamaoua",
    description: "Langue de la zone de Nkambe, importante communauté.",
  },
  {
    id: 28,
    name: "Tikar",
    iso: "tik",
    lat: 6.08,
    lng: 12.08,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 100000,
    vitality: "stable",
    region: "Centre/Nord-Ouest",
    description:
      "Peuple Tikar du Mbam; nombreux groupes en sont issus culturellement.",
  },
  {
    id: 29,
    name: "Mbo (Mbo')",
    iso: "mbo",
    lat: 5.22,
    lng: 9.87,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 40000,
    vitality: "stable",
    region: "Littoral/Ouest",
    description: "Parlé dans la Moungo, à la limite Littoral-Ouest.",
  },
  {
    id: 30,
    name: "Banen",
    iso: "baz",
    lat: 4.58,
    lng: 10.78,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 35000,
    vitality: "vulnerable",
    region: "Littoral/Centre",
    description: "Groupe Bantu du Mbam, sous pression des grandes langues.",
  },
  {
    id: 31,
    name: "Lefa (Bantu)",
    iso: "lef",
    lat: 5.35,
    lng: 10.75,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 25000,
    vitality: "vulnerable",
    region: "Ouest",
    description: "Petite langue bantoïde de l'Ouest camerounais.",
  },
  {
    id: 32,
    name: "Pinyin",
    iso: "pny",
    lat: 6.0,
    lng: 10.35,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 18000,
    vitality: "vulnerable",
    region: "Nord-Ouest",
    description: "Langue Ngemba parlée autour de Pinyin/Akum.",
  },

  // ── Niger-Congo: Adamawa ──────────────────────────────────────
  {
    id: 33,
    name: "Fulfulde (Fula)",
    iso: "fub",
    lat: 7.5,
    lng: 13.5,
    family: "Niger-Congo",
    subfamily: "Adamawa-Ubangi",
    speakers: 3000000,
    vitality: "stable",
    region: "Nord/Adamaoua/Est",
    description:
      "Langue pastorale des Peul, lingua franca du Grand Nord camerounais.",
  },
  {
    id: 34,
    name: "Mboum",
    iso: "mdo",
    lat: 6.7,
    lng: 14.2,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 80000,
    vitality: "stable",
    region: "Adamaoua",
    description: "Peuple de la savane adamawa, culture de l'igname.",
  },
  {
    id: 35,
    name: "Gbaya",
    iso: "gya",
    lat: 5.8,
    lng: 14.6,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 200000,
    vitality: "stable",
    region: "Est/Adamaoua",
    description: "Partagé entre Cameroun, RCA et RDC.",
  },
  {
    id: 36,
    name: "Dii (Dourou)",
    iso: "dur",
    lat: 7.3,
    lng: 14.45,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 60000,
    vitality: "stable",
    region: "Adamaoua",
    description: "Peuple de la vallée de la Bénoué supérieure.",
  },
  {
    id: 37,
    name: "Mundang",
    iso: "mua",
    lat: 9.2,
    lng: 15.1,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 40000,
    vitality: "stable",
    region: "Nord",
    description: "Groupe Mundang du Logone-et-Chari, frontalier avec le Tchad.",
  },
  {
    id: 38,
    name: "Ngambay",
    iso: "sba",
    lat: 9.5,
    lng: 15.6,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 100000,
    vitality: "stable",
    region: "Nord/Extrême-Nord",
    description: "Langue Sara-Bongo-Bagirmi, parlé au Cameroun et au Tchad.",
  },
  {
    id: 39,
    name: "Tiba",
    iso: "tbr",
    lat: 7.0,
    lng: 14.8,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 15000,
    vitality: "vulnerable",
    region: "Adamaoua/Est",
    description: "Petite langue de l'Adamaoua en déclin progressif.",
  },
  {
    id: 40,
    name: "Vute",
    iso: "vut",
    lat: 6.4,
    lng: 14.0,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 25000,
    vitality: "vulnerable",
    region: "Adamaoua",
    description: "Langue Vute-Wawa de la bordure Adamaoua-Est.",
  },

  // ── Niger-Congo: Ubangian ─────────────────────────────────────
  {
    id: 41,
    name: "Zande",
    iso: "zne",
    lat: 4.8,
    lng: 25.5,
    family: "Ubangian",
    subfamily: "Ubangian",
    speakers: 30000,
    vitality: "stable",
    region: "Est",
    description: "Partagé entre Cameroun, RDC, RCA et Soudan du Sud.",
  },
  {
    id: 42,
    name: "Ngbaka",
    iso: "nga",
    lat: 4.4,
    lng: 16.8,
    family: "Ubangian",
    subfamily: "Ubangian",
    speakers: 20000,
    vitality: "stable",
    region: "Est",
    description: "Petite communauté oubanguienne au sud-est du Cameroun.",
  },

  // ── Afro-Asiatic: Chadic ──────────────────────────────────────
  {
    id: 43,
    name: "Hausa",
    iso: "hau",
    lat: 10.4,
    lng: 13.6,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 100000,
    vitality: "stable",
    region: "Extrême-Nord",
    description:
      "Lingua franca commerciale islamique, parlé surtout par des migrants.",
  },
  {
    id: 44,
    name: "Kotoko (Logone)",
    iso: "lko",
    lat: 11.8,
    lng: 15.0,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 50000,
    vitality: "stable",
    region: "Extrême-Nord",
    description: "Groupe Kotoko islamisé sur les rives du Logone.",
  },
  {
    id: 45,
    name: "Musey",
    iso: "mse",
    lat: 10.5,
    lng: 14.8,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 60000,
    vitality: "stable",
    region: "Extrême-Nord",
    description: "Langue tchadique de la plaine de Kaélé.",
  },
  {
    id: 46,
    name: "Mafa",
    iso: "maf",
    lat: 10.5,
    lng: 13.9,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 200000,
    vitality: "stable",
    region: "Extrême-Nord",
    description:
      "Parlé dans les Monts Mandara, importante communauté animiste.",
  },
  {
    id: 47,
    name: "Mofu-Gudur",
    iso: "mif",
    lat: 10.7,
    lng: 14.2,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 70000,
    vitality: "stable",
    region: "Extrême-Nord",
    description: "Langue des montagnes Mandara nord.",
  },
  {
    id: 48,
    name: "Podoko",
    iso: "pod",
    lat: 10.8,
    lng: 13.8,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 40000,
    vitality: "stable",
    region: "Extrême-Nord",
    description: "Proche du Mafa, Monts Mandara.",
  },
  {
    id: 49,
    name: "Dugwor",
    iso: "dgr",
    lat: 10.65,
    lng: 14.05,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 25000,
    vitality: "vulnerable",
    region: "Extrême-Nord",
    description: "Petite langue tchadique des Mandara, vitalité fragile.",
  },
  {
    id: 50,
    name: "Mandara (Wandala)",
    iso: "tbf",
    lat: 10.95,
    lng: 14.1,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 40000,
    vitality: "stable",
    region: "Extrême-Nord",
    description: "Groupe tchadique de la ville de Mora.",
  },
  {
    id: 51,
    name: "Tera",
    iso: "ter",
    lat: 11.1,
    lng: 14.6,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 15000,
    vitality: "vulnerable",
    region: "Extrême-Nord",
    description: "Partagé avec le Nigeria, petite communauté.",
  },
  {
    id: 52,
    name: "Giziga",
    iso: "giz",
    lat: 10.6,
    lng: 14.3,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 60000,
    vitality: "stable",
    region: "Extrême-Nord",
    description: "Langue tchadique de Maroua et ses environs.",
  },
  {
    id: 53,
    name: "Muktele",
    iso: "moz",
    lat: 10.7,
    lng: 13.7,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 20000,
    vitality: "vulnerable",
    region: "Extrême-Nord",
    description: "Petite communauté montagneuse des Mandara.",
  },
  {
    id: 54,
    name: "Massa",
    iso: "mcn",
    lat: 10.3,
    lng: 15.6,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 140000,
    vitality: "stable",
    region: "Extrême-Nord",
    description:
      "Peuple Musgum/Massa du Logone, connus pour leurs greniers en cône.",
  },
  {
    id: 55,
    name: "Arab Choa",
    iso: "shu",
    lat: 11.5,
    lng: 15.3,
    family: "Afro-Asiatic",
    subfamily: "Semitic",
    speakers: 100000,
    vitality: "stable",
    region: "Extrême-Nord",
    description: "Arabe dialectal des communautés arabes du lac Tchad.",
  },
  {
    id: 56,
    name: "Kanuri",
    iso: "kau",
    lat: 11.9,
    lng: 14.7,
    family: "Nilo-Saharan",
    subfamily: "Saharan",
    speakers: 50000,
    vitality: "stable",
    region: "Extrême-Nord",
    description:
      "Peuple Kanuri autour du lac Tchad, partagé avec Nigeria et Niger.",
  },
  {
    id: 57,
    name: "Tupuri",
    iso: "tui",
    lat: 10.0,
    lng: 14.9,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 215000,
    vitality: "stable",
    region: "Extrême-Nord/Nord",
    description: "Peuple Tupuri du Mayo-Kébbi et du Diamaré.",
  },
  {
    id: 58,
    name: "Lame",
    iso: "bid",
    lat: 9.7,
    lng: 13.8,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 30000,
    vitality: "vulnerable",
    region: "Nord",
    description: "Langue tchadique peu documentée du Bénoué.",
  },
  {
    id: 59,
    name: "Hdi (Xdi)",
    iso: "xdi",
    lat: 10.9,
    lng: 13.65,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 25000,
    vitality: "stable",
    region: "Extrême-Nord",
    description:
      "Langue de la montagne, connue pour son système verbal complexe.",
  },

  // ── Afro-Asiatic: Semitic ─────────────────────────────────────
  {
    id: 60,
    name: "Fulfulde Adamawa",
    iso: "fub",
    lat: 7.5,
    lng: 13.4,
    family: "Niger-Congo",
    subfamily: "Atlantic-Congo",
    speakers: 2000000,
    vitality: "stable",
    region: "Adamaoua",
    description: "Variante Adamawa du Fulfuldé, parlée dans les hautes terres.",
  },

  // ── Nilo-Saharan ──────────────────────────────────────────────
  {
    id: 61,
    name: "Sango",
    iso: "sag",
    lat: 4.5,
    lng: 15.8,
    family: "Niger-Congo",
    subfamily: "Ubangian",
    speakers: 15000,
    vitality: "vulnerable",
    region: "Est",
    description:
      "Utilisé comme lingua franca en RCA, quelques locuteurs à l'Est.",
  },
  {
    id: 62,
    name: "Bagirmi",
    iso: "bmi",
    lat: 11.5,
    lng: 15.0,
    family: "Nilo-Saharan",
    subfamily: "Bongo-Bagirmi",
    speakers: 20000,
    vitality: "vulnerable",
    region: "Extrême-Nord",
    description: "Langue des Arabes Choa et Kotoko de la zone du lac.",
  },

  // ── Pygmy / Isolates ──────────────────────────────────────────
  {
    id: 63,
    name: "Baka (Pygmée)",
    iso: "bkc",
    lat: 3.2,
    lng: 14.5,
    family: "Niger-Congo",
    subfamily: "Ubangian",
    speakers: 30000,
    vitality: "vulnerable",
    region: "Est/Sud",
    description:
      "Langue des Baka, peuple de la forêt tropicale. Culture de chasseurs-cueilleurs.",
  },
  {
    id: 64,
    name: "Bagyeli (Kola)",
    iso: "bbx",
    lat: 2.95,
    lng: 10.4,
    family: "Unclassified",
    subfamily: "Isolat",
    speakers: 4000,
    vitality: "endangered",
    region: "Sud/Océan",
    description:
      "Pygmées Bagyeli de la côte camerounaise, langue très menacée.",
  },
  {
    id: 65,
    name: "Bedzan (Tikar Pygmy)",
    iso: "bfp",
    lat: 5.5,
    lng: 12.0,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 2500,
    vitality: "critical",
    region: "Centre",
    description:
      "Pygmées Bedzan, communauté minuscule, langue en danger critique.",
  },

  // ── More Niger-Congo diverse ───────────────────────────────────
  {
    id: 66,
    name: "Doyayo",
    iso: "dow",
    lat: 8.2,
    lng: 14.6,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 25000,
    vitality: "stable",
    region: "Nord",
    description: "Langue de la zone Poli, Bénoué Nord.",
  },
  {
    id: 67,
    name: "Chamba Daka",
    iso: "cdj",
    lat: 7.8,
    lng: 14.0,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 15000,
    vitality: "vulnerable",
    region: "Adamaoua/Nord",
    description: "Chamba du plateau de l'Adamaoua.",
  },
  {
    id: 68,
    name: "Karang",
    iso: "kzr",
    lat: 7.1,
    lng: 14.6,
    family: "Niger-Congo",
    subfamily: "Adamawa",
    speakers: 30000,
    vitality: "stable",
    region: "Adamaoua",
    description: "Langue parlée dans le Mbéré, Adamaoua.",
  },
  {
    id: 69,
    name: "Voko",
    iso: "vok",
    lat: 9.0,
    lng: 13.5,
    family: "Afro-Asiatic",
    subfamily: "Chadic",
    speakers: 8000,
    vitality: "endangered",
    region: "Nord",
    description: "Langue tchadique très menacée de la plaine de Bénoué.",
  },
  {
    id: 70,
    name: "Mambila",
    iso: "mcu",
    lat: 6.5,
    lng: 11.0,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 35000,
    vitality: "stable",
    region: "Adamaoua/Nord-Ouest",
    description: "Partagé entre le plateau mambila (Nigeria-Cameroun).",
  },
  {
    id: 71,
    name: "Kwanja",
    iso: "knp",
    lat: 6.8,
    lng: 12.5,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 8000,
    vitality: "endangered",
    region: "Adamaoua",
    description: "Petite langue du plateau adamawa, peu documentée.",
  },
  {
    id: 72,
    name: "Baali",
    iso: "bcp",
    lat: 5.6,
    lng: 14.5,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 12000,
    vitality: "vulnerable",
    region: "Est",
    description: "Langue bantu de la zone forêt-savane à l'est.",
  },
  {
    id: 73,
    name: "Kako",
    iso: "kkj",
    lat: 5.2,
    lng: 14.0,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 25000,
    vitality: "stable",
    region: "Est",
    description: "Langue bantu de l'est du Cameroun.",
  },
  {
    id: 74,
    name: "Njem",
    iso: "njk",
    lat: 3.8,
    lng: 14.8,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 8000,
    vitality: "vulnerable",
    region: "Est",
    description:
      "Langue bantu de la grande forêt du sud-est, région de Yokadouma.",
  },
  {
    id: 75,
    name: "Bomwali",
    iso: "bmw",
    lat: 2.5,
    lng: 15.6,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 5000,
    vitality: "endangered",
    region: "Sud",
    description: "Petite langue de la frontière tripartite Cameroun-Congo-RCA.",
  },
  {
    id: 76,
    name: "Makaa",
    iso: "mcp",
    lat: 3.5,
    lng: 13.0,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 60000,
    vitality: "stable",
    region: "Sud/Est",
    description: "Langue bantu du centre-est, zone de Abong-Mbang.",
  },
  {
    id: 77,
    name: "Nzime",
    iso: "nzb",
    lat: 3.2,
    lng: 13.5,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 25000,
    vitality: "stable",
    region: "Est",
    description: "Proche du Makaa, groupe Makaa-Njem de l'Est.",
  },
  {
    id: 78,
    name: "Yambeta",
    iso: "yat",
    lat: 4.8,
    lng: 12.7,
    family: "Niger-Congo",
    subfamily: "Bantu",
    speakers: 18000,
    vitality: "vulnerable",
    region: "Centre",
    description: "Langue du Mbam, à cheval Centre-Adamaoua.",
  },
  {
    id: 79,
    name: "Bamun (Bamoun)",
    iso: "bax",
    lat: 5.72,
    lng: 10.88,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 300000,
    vitality: "stable",
    region: "Ouest",
    description:
      "Langue du sultanat Bamoun, seule langue africaine avec un syllabaire inventé au XIXe siècle (A-Ka-U).",
  },
  {
    id: 80,
    name: "Mengaka",
    iso: "xmg",
    lat: 5.12,
    lng: 10.23,
    family: "Niger-Congo",
    subfamily: "Bantoid",
    speakers: 45000,
    vitality: "stable",
    region: "Littoral/Ouest",
    description: "Langue des hautes terres de la Moungo-Nkam.",
  },
];

function normalizeLanguage(lang) {
  return {
    ...lang,
    name: lang.name || "Langue inconnue",
    iso: lang.iso || "und",
    family: lang.family || "Unclassified",
    subfamily: lang.subfamily || "Isolat",
    speakers: Number(lang.speakers) || 0,
    vitality: lang.vitality || "stable",
    region: lang.region || "Cameroun",
    description: lang.description || "",
  };
}

function normalizeLanguageDataset(data) {
  return (Array.isArray(data) ? data : EMBEDDED_LANGUAGES).map(
    normalizeLanguage,
  );
}

let LANGUAGE_DATA = normalizeLanguageDataset(window.NERALA_LANGUAGE_DATA);

function readStoredView() {
  try {
    return localStorage.getItem("nerala-map-view");
  } catch (error) {
    return null;
  }
}

function persistView(viewKey) {
  try {
    localStorage.setItem("nerala-map-view", viewKey);
  } catch (error) {
    return;
  }
}

function setLanguageData(nextData) {
  LANGUAGE_DATA = normalizeLanguageDataset(nextData);
  buildMarkers(currentData());
}

window.NeralaLanguageMap = {
  getLanguages: () => LANGUAGE_DATA,
  setLanguages: setLanguageData,
  setView: setMapView,
  getView: () => activeViewKey,
};

// ═══════════════════════════════════════════════════════════════
//  FAMILY CONFIG
// ═══════════════════════════════════════════════════════════════
const FAMILY_CONFIG = {
  "Niger-Congo": { color: "#e05a2b", label: "Niger-Congo" },
  "Afro-Asiatic": { color: "#3b9ede", label: "Afro-Asiatique" },
  "Nilo-Saharan": { color: "#7dc87d", label: "Nilo-Saharien" },
  Ubangian: { color: "#b07fd4", label: "Oubanguien" },
  Unclassified: { color: "#a0a0a0", label: "Autre / Isolat" },
};

const VITALITY_CONFIG = {
  stable: { icon: "🟢", label: "Stable", color: "#4caf50", pct: 90 },
  vulnerable: {
    icon: "🟡",
    label: "Vulnérable",
    color: "#ffc107",
    pct: 55,
  },
  endangered: {
    icon: "🔴",
    label: "En danger",
    color: "#f44336",
    pct: 25,
  },
  critical: { icon: "💀", label: "Critique", color: "#9c27b0", pct: 5 },
};

// ═══════════════════════════════════════════════════════════════
//  MAP INIT
// ═══════════════════════════════════════════════════════════════
const map = L.map("map", {
  center: [5.5, 12.5],
  zoom: 6,
  zoomControl: true,
  attributionControl: true,
});

const MAP_VIEWS = {
  terrain: {
    label: "Terrain",
    description: "Relief et routes",
    layer: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      subdomains: "abc",
      maxZoom: 17,
    }),
  },

  light: {
    label: "Clair",
    description: "Vue cartographique classique",
    layer: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abc",
      maxZoom: 19,
    }),
  },
  dark: {
    label: "Sombre",
    description: "Fond contrasté",
    layer: L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      },
    ),
  },

  satellite: {
    label: "Satellite",
    description: "Imagerie et contexte réel",
    layer: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri",
        maxZoom: 19,
      },
    ),
  },
};

// ═══════════════════════════════════════════════════════════════
//  MOBILE DETECTION AND HELPERS
// ═══════════════════════════════════════════════════════════════
function isMobileScreen() {
  return window.innerWidth <= 768;
}

function getMobileAvailableViews() {
  return ["terrain", "dark"];
}

let activeViewKey = readStoredView() || "terrain";
let activeBaseLayer = null;

function setMapView(viewKey) {
  const nextView = MAP_VIEWS[viewKey] ? viewKey : "terrain";
  if (activeBaseLayer) {
    map.removeLayer(activeBaseLayer);
  }
  activeBaseLayer = MAP_VIEWS[nextView].layer;
  activeBaseLayer.addTo(map);
  activeViewKey = nextView;
  persistView(nextView);

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === nextView);
  });
}

// ─ Filter views on mobile: only terrain & dark ─
const viewsToDisplay = isMobileScreen()
  ? getMobileAvailableViews()
  : Object.keys(MAP_VIEWS);

viewsToDisplay.forEach((key) => {
  const cfg = MAP_VIEWS[key];
  const button = document.createElement("button");
  button.type = "button";
  button.className = "view-btn";
  button.dataset.view = key;
  button.textContent = cfg.label;
  button.title = cfg.description;
  button.addEventListener("click", () => setMapView(key));
  document.getElementById("view-switcher").appendChild(button);
});

setMapView(activeViewKey);

// ═══════════════════════════════════════════════════════════════
//  CREATE MARKERS
// ═══════════════════════════════════════════════════════════════
function getFamilyColor(fam) {
  return (FAMILY_CONFIG[fam] || FAMILY_CONFIG["Unclassified"]).color;
}

function createMarkerIcon(lang) {
  const color = getFamilyColor(lang.family);
  const vit = VITALITY_CONFIG[lang.vitality] || VITALITY_CONFIG.stable;
  const size = Math.max(10, Math.min(22, Math.log10(lang.speakers) * 4.5));
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px; height:${size}px; border-radius:50%;
        background:${color}; border:2px solid rgba(255,255,255,0.6);
        box-shadow:0 0 8px ${color}88;
        cursor:pointer; transition:transform 0.15s;
        display:flex; align-items:center; justify-content:center;
      " title="${lang.name}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ═══════════════════════════════════════════════════════════════
//  CLUSTER GROUP
// ═══════════════════════════════════════════════════════════════
const clusterGroup = L.markerClusterGroup({
  maxClusterRadius: 60,
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  disableClusteringAtZoom: 10,
  iconCreateFunction: function (cluster) {
    const count = cluster.getChildCount();
    const size = count > 50 ? 48 : count > 20 ? 42 : count > 10 ? 36 : 30;
    return L.divIcon({
      html: `<div style="
        width:${size}px; height:${size}px; border-radius:50%;
        background:rgba(240,165,0,0.92);
        border:3px solid rgba(255,255,255,0.35);
        display:flex; align-items:center; justify-content:center;
        font-family:'DM Sans',sans-serif; font-weight:700;
        font-size:${size > 40 ? "0.85" : "0.75"}rem; color:#0e1117;
        box-shadow:0 2px 12px rgba(240,165,0,0.5);
        cursor:pointer;
      ">${count}</div>`,
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  },
});

// ═══════════════════════════════════════════════════════════════
//  PANEL
// ═══════════════════════════════════════════════════════════════
function openPanel(lang) {
  const fam = FAMILY_CONFIG[lang.family] || FAMILY_CONFIG["Unclassified"];
  const vit = VITALITY_CONFIG[lang.vitality] || VITALITY_CONFIG.stable;
  const spk =
    lang.speakers >= 1000000
      ? (lang.speakers / 1000000).toFixed(1) + "M"
      : lang.speakers >= 1000
        ? Math.round(lang.speakers / 1000) + "K"
        : lang.speakers;

  document.getElementById("panel-content").innerHTML = `
    <span class="lang-family-badge" style="background:${fam.color}22;color:${fam.color};border:1px solid ${fam.color}55">
      ${fam.label}
    </span>
    <h2>${lang.name}</h2>
    <div class="lang-iso">ISO 639-3: <strong>${lang.iso}</strong> &nbsp;·&nbsp; ${lang.subfamily}</div>

    <div class="info-grid">
      <div class="info-card">
        <div class="label">Locuteurs</div>
        <div class="value">${spk}</div>
      </div>
      <div class="info-card">
        <div class="label">Vitalité</div>
        <div class="value">${vit.icon} ${vit.label}</div>
      </div>
      <div class="info-card full">
        <div class="label">Famille</div>
        <div class="value">${lang.family} › ${lang.subfamily}</div>
      </div>
      <div class="info-card full vitality-bar-wrap">
        <div class="label">Indice de vitalité</div>
        <div class="vitality-bar">
          <div class="vitality-fill" style="width:${vit.pct}%;background:${vit.color}"></div>
        </div>
      </div>
    </div>

    <div class="info-section-title">Région principale</div>
    <div class="region-tags" style="margin-bottom:16px">
      ${lang.region
        .split("/")
        .map((r) => `<span class="region-tag">${r.trim()}</span>`)
        .join("")}
    </div>

    <div class="info-section-title">Description</div>
    <p style="font-size:0.82rem;line-height:1.65;color:#c0c8d8">${lang.description}</p>

    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
      <div style="font-size:0.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Coordonnées</div>
      <div style="font-size:0.75rem;color:var(--muted)">${lang.lat.toFixed(4)}°N, ${lang.lng.toFixed(4)}°E</div>
    </div>
  `;
  document.getElementById("info-panel").classList.add("open");
}

document.getElementById("close-panel").addEventListener("click", () => {
  document.getElementById("info-panel").classList.remove("open");
});

// ═══════════════════════════════════════════════════════════════
//  BUILD MARKERS
// ═══════════════════════════════════════════════════════════════
let allMarkers = [];
let activeFilters = new Set(Object.keys(FAMILY_CONFIG));

function buildMarkers(data) {
  clusterGroup.clearLayers();
  allMarkers = [];

  data.forEach((lang) => {
    if (!activeFilters.has(lang.family)) return;
    const marker = L.marker([lang.lat, lang.lng], {
      icon: createMarkerIcon(lang),
    });

    // Tooltip
    marker.bindTooltip(
      `
      <div style="font-family:'DM Sans',sans-serif;min-width:160px">
        <div style="font-weight:700;font-size:0.9rem;margin-bottom:3px">${lang.name}</div>
        <div style="font-size:0.72rem;color:#aaa">${lang.family} · ${lang.subfamily}</div>
        <div style="font-size:0.72rem;margin-top:4px">${VITALITY_CONFIG[lang.vitality]?.icon} ${VITALITY_CONFIG[lang.vitality]?.label}</div>
      </div>
    `,
      {
        direction: "top",
        offset: [0, -6],
        opacity: 0.97,
        className: "custom-tooltip",
      },
    );

    marker.on("click", () => {
      map.setView([lang.lat, lang.lng], Math.max(map.getZoom(), 8), {
        animate: true,
      });
      openPanel(lang);
    });

    allMarkers.push({ marker, lang });
    clusterGroup.addLayer(marker);
  });

  document.getElementById("shown-count").textContent = data.filter((l) =>
    activeFilters.has(l.family),
  ).length;
}

map.addLayer(clusterGroup);

// ═══════════════════════════════════════════════════════════════
//  FILTERS
// ═══════════════════════════════════════════════════════════════
const filtersEl = document.getElementById("filters");

Object.entries(FAMILY_CONFIG).forEach(([key, cfg]) => {
  const btn = document.createElement("button");
  btn.className = "filter-btn active";
  btn.dataset.family = key;
  btn.innerHTML = `<span class="dot" style="background:${cfg.color}"></span>${cfg.label}`;
  btn.addEventListener("click", () => {
    if (activeFilters.has(key)) {
      if (activeFilters.size === 1) return; // keep at least 1
      activeFilters.delete(key);
      btn.classList.remove("active");
    } else {
      activeFilters.add(key);
      btn.classList.add("active");
    }
    buildMarkers(currentData());
  });
  filtersEl.appendChild(btn);
});

// ═══════════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════════
function currentData() {
  const q = document.getElementById("search-input").value.trim().toLowerCase();
  if (!q) return LANGUAGE_DATA;
  return LANGUAGE_DATA.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.iso.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q) ||
      l.family.toLowerCase().includes(q) ||
      l.subfamily.toLowerCase().includes(q),
  );
}

document.getElementById("search-input").addEventListener("input", () => {
  const results = currentData();
  buildMarkers(results);
  if (results.length === 1) {
    const l = results[0];
    map.flyTo([l.lat, l.lng], 9, { duration: 1.2 });
    openPanel(l);
  }
});

// ═══════════════════════════════════════════════════════════════
//  ZOOM HINT
// ═══════════════════════════════════════════════════════════════
const zoomHint = document.getElementById("zoom-hint");
map.on("zoomend", () => {
  const z = map.getZoom();
  if (z >= 9) {
    zoomHint.textContent = "📍 Cliquez sur un marqueur pour les détails";
  } else {
    zoomHint.textContent = "🔍 Zoomez pour explorer les clusters";
  }
});

// ═══════════════════════════════════════════════════════════════
//  TOOLTIP STYLE (injected)
// ═══════════════════════════════════════════════════════════════
const style = document.createElement("style");
style.textContent = `
  .custom-tooltip {
    background: #1c2333 !important;
    border: 1px solid #2a3450 !important;
    border-radius: 8px !important;
    padding: 8px 12px !important;
    color: #e8eaf0 !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
  }
  .custom-tooltip::before { border-top-color: #2a3450 !important; }
  .leaflet-tooltip-top::before { border-top-color: #2a3450 !important; }
`;
document.head.appendChild(style);

// ═══════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════
buildMarkers(currentData());

// Click on map → close panel
map.on("click", () => {
  document.getElementById("info-panel").classList.remove("open");
});
