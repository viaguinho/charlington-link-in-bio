// Conteúdo da página. Editar aqui — nenhum texto fica hardcoded nos componentes.

const maps = (q) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

export const SCROLL_CUE = 'Role para explorar'

export const PROFILE = {
  name: 'Dr. Charlington Cavalcante',
  // Quebra manual: a cápsula é esbelta e o nome não cabe em uma linha.
  nameLines: ['Dr. Charlington', 'Cavalcante'],
  specialty: 'Neuropediatra',
  // Exigido pela Resolução CFM 2.336/2023 em material de divulgação.
  council: [
    'CRM-CE 14.212, RQE 13562',
    'CRM-CE 14.212, RQE 13563',
    'CRM-CE 14.212, RQE 13584',
    'CRM-SP 173.176, RQE 744911 .',
    'CRM-SP 173.176, RQE 82724',
  ],
}

export const ABOUT_TITLE = ['O CUIDADO QUE', 'VAI ALÉM DA', 'MEDICINA.']
export const ABOUT_TITLE_EN = ['CARE THAT GOES', 'BEYOND', 'MEDICINE.']

export const BIO = [
  "Charlington Cavalcante é um <strong class=\"text-white font-semibold\">neuropediatra</strong> cuja prática reflete uma vida moldada pela busca incansável por conexões verdadeiras e um cuidado infantil que vai além do consultório. Nascido com uma vocação inata para a medicina, ele entende que o diagnóstico é apenas o começo de uma jornada que envolve a criança, a família e todo o seu ecossistema.",
  "Sua trajetória de excelência começou com a graduação pela Universidade Estadual do Ceará (UECE), seguida pela residência em pediatria geral na Escola de Saúde Pública do Ceará (ESP-CE). Essa base humanista logo se expandiu para especializações em <strong class=\"text-white font-semibold\">neurologia infantil</strong> e <strong class=\"text-white font-semibold\">neurofisiologia clínica</strong> pela Universidade Estadual de Campinas (Unicamp).",
  "Movido pela ciência, obteve seu Mestrado em Neurologia também pela Unicamp e buscou aprimoramento contínuo em áreas como <strong class=\"text-white font-semibold\">Medicina do Sono</strong> pelo Instituto do Sono. Sua visão global foi expandida por meio de um observership no SickKids Hospital (Canadá) e de cursos de extensão em instituições como Utrecht University e UC Davis.",
  "Seu compromisso com o desenvolvimento infantil o levou a aprofundar-se no <strong class=\"text-white font-semibold\">Transtorno do Espectro Autista</strong> e no <strong class=\"text-white font-semibold\">Transtorno Opositivo Desafiador</strong>, com formações no Miami Children's Behavior Institute. Essas experiências permitem que ele colabore com as famílias na criação de projetos terapêuticos inovadores.",
  "Ao longo de sua carreira, assumiu posições de liderança, incluindo a chefia do ambulatório da síndrome do Zika vírus congênita do Hospital Infantil Albert Sabin (HIAS) e a preceptoria de residência médica na ESP-CE, guiando novas gerações de médicos.",
  "Atendendo em Campinas e Fortaleza, Charlington é um profissional inquieto, sempre em busca de novas perspectivas e histórias para cuidar. A constante busca por uma <strong class=\"text-white font-semibold\">abordagem individualizada e profundamente humana</strong> é a marca registrada de seu trabalho, dando a cada consulta um toque singular de acolhimento."
]

export const BIO_EN = [
  "Charlington Cavalcante is a <strong class=\"text-white font-semibold\">pediatric neurologist</strong> whose practice reflects a life shaped by the relentless pursuit of genuine connections and childcare that goes beyond the clinic. Born with an innate calling for medicine, he understands that a diagnosis is just the beginning of a journey involving the child, the family, and their entire ecosystem.",
  "His trajectory of excellence began with a medical degree from Universidade Estadual do Ceará (UECE), followed by a residency in general pediatrics at Escola de Saúde Pública do Ceará (ESP-CE). This humanistic foundation quickly expanded into specializations in <strong class=\"text-white font-semibold\">pediatric neurology</strong> and <strong class=\"text-white font-semibold\">clinical neurophysiology</strong> at Universidade Estadual de Campinas (Unicamp).",
  "Driven by science, he obtained his Master's degree in Neurology also from Unicamp and sought continuous improvement in areas such as <strong class=\"text-white font-semibold\">Sleep Medicine</strong> at Instituto do Sono. His global perspective was broadened through an observership at SickKids Hospital (Canada) and extension courses at institutions like Utrecht University and UC Davis.",
  "His commitment to child development led him to delve into <strong class=\"text-white font-semibold\">Autism Spectrum Disorder</strong> and <strong class=\"text-white font-semibold\">Oppositional Defiant Disorder</strong>, with training at the Miami Children's Behavior Institute. These experiences allow him to collaborate with families by creating innovative therapeutic projects.",
  "Throughout his career, he has taken on clinical leadership roles, including heading the Congenital Zika Virus Syndrome outpatient clinic at Hospital Infantil Albert Sabin (HIAS) and serving as a medical residency preceptor at ESP-CE, guiding new generations of doctors.",
  "Consulting in Campinas and Fortaleza, Charlington is a restless professional, always in search of new perspectives and stories to care for. A constant search for an <strong class=\"text-white font-semibold\">individualized and deeply human approach</strong> is the hallmark of his work, giving each consultation a unique touch of warmth."
]

export const TOP_NAV = {
  left: [
    { label: 'Infos', action: 'faq' },
    { label: 'Sobre', action: 'about' },
  ],
  right: [
    { label: 'Contato', href: 'https://wa.me/5519971502747' },
  ],
}

export const FAQ = [
  {
    question: 'Qual o horário de atendimento?',
    answer: 'Segunda a sexta, das 08:00 às 18:00, apenas com horário&nbsp;marcado.',
  },
  {
    question: 'Como agendar uma consulta?',
    answer: 'O agendamento para Campinas e Fortaleza é feito pelo&nbsp;<a href="https://api.whatsapp.com/send/?phone=5519971502747&text=Ol%C3%A1%21+Vi+seu+contato+no+site+e+gostaria+de+agendar+um+servi%C3%A7o.+Obrigado+pela+aten%C3%A7%C3%A3o%21&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" class="text-[#0071e3] hover:text-blue-700 underline underline-offset-2 transition-colors">WhatsApp</a>.',
  },
  {
    question: 'Qual a localização?',
    answer: '<strong>Campinas:</strong> Av. José Rocha Bomfim, 214,&nbsp;SP.<br><a href="https://www.google.com/maps/search/?api=1&query=Avenida+Jos%C3%A9+Rocha+Bomfim,+214+-+Jardim+Santa+Genebra,+Campinas+-+SP" target="_blank" rel="noopener noreferrer" class="text-[#0071e3] hover:text-blue-700 underline underline-offset-2 transition-colors">Ver no&nbsp;mapa</a><br><br><strong>Fortaleza:</strong> Av. Pontes Vieira, 2340, sala 704,&nbsp;CE.<br><a href="https://www.google.com/maps/search/?api=1&query=Av.+Pontes+Vieira,+2340,+sala+704+-+Dion%C3%ADsio+Torres,+Fortaleza+-+CE" target="_blank" rel="noopener noreferrer" class="text-[#0071e3] hover:text-blue-700 underline underline-offset-2 transition-colors">Ver no&nbsp;mapa</a>',
  },
  {
    question: 'Aceita convênios?',
    answer: 'As consultas são estritamente particulares para garantir mais tempo e cuidado. Emitimos a documentação necessária para você solicitar reembolso no seu&nbsp;convênio.',
  },
  {
    question: 'Quais as formas de pagamento?',
    answer: 'Aceitamos PIX, dinheiro e cartões de débito ou&nbsp;crédito.',
  },
  {
    question: 'Tem estacionamento?',
    answer: 'Sim, ambos os consultórios contam com estacionamento&nbsp;privativo.',
  },
]

/*
  Rótulos curtos, na economia de palavras da referência ("All Works", "About",
  "Contact"). Uma cápsula de raio total não comporta rótulos longos em uma linha,
  e alargá-la para caber destruiria a proporção que faz a forma funcionar.
*/
export const LINKS = [
  {
    id: 'whatsapp',
    label: 'Agendar',
    href: 'https://wa.me/5519971502747',
    primary: true,
  },
  {
    id: 'addresses',
    label: 'Endereços',
  },
  {
    id: 'groups',
    label: 'Grupos',
    href: '#',
  },
  {
    id: 'site',
    label: 'Site',
    href: 'https://charlington.com.br/',
  },
]

export const ADDRESSES = [
  {
    id: 'campinas',
    label: 'Campinas',
    href: maps(
      'Praça Capital, Av. José Rocha Bonfim, 214, Jardim Santa Genebra, Campinas - SP',
    ),
  },
  {
    id: 'fortaleza',
    label: 'Fortaleza',
    href: maps(
      'Edifício Uno Medical Office, Av. Pontes Vieira, 2340, São João do Tauape, Fortaleza - CE',
    ),
  },
]

export const GROUPS = [
  {
    id: 'canal-oficial',
    tag: 'Grupo no WhatsApp',
    title: 'Canal Oficial',
    sub: 'receber materiais e avisos',
    callout:
      'Receba em primeira mão materiais, artigos e avisos do Dr. Charlington. Só leitura, sem ruído.',
    href:
      'https://chat.whatsapp.com/H7hfGN1WBB7AiQXDpsruoZ?s=cl&p=i&mlu=4&amv=1',
    video: '',
    image: '/Grupo1.jpg',
  },
  {
    id: 'comunidade',
    tag: 'Grupo no WhatsApp',
    title: 'Comunidade',
    sub: 'entrar no grupo de famílias',
    callout:
      'Um espaço para trocar, comentar e tirar dúvidas com outros pacientes e famílias.',
    href:
      'https://chat.whatsapp.com/EQadFK0PMldHhXaP99q8wA?s=cl&p=i&mlu=4&amv=1',
    image: '/Grupo2.jpg',
  },
]

export const SOCIALS = [
  {
    id: 'instagram',
    label: 'Instagram de Dr. Charlington Cavalcante',
    href: 'https://instagram.com/charlington.cavalcante',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn de Dr. Charlington Cavalcante',
    href: 'https://www.linkedin.com/in/ch%C3%A1rlington-cavalcante-42453891',
  },
  {
    id: 'doctoralia',
    label: 'Doctoralia de Dr. Charlington Cavalcante',
    href: 'https://www.doctoralia.com.br/charlington-cavalcante/neurologista-pediatrico-pediatra-neurofisiologista/campinas',
  },
]

