/* =========================================================================
   CONFIGURAÇÕES CENTRALIZADAS — TIO RENATO
   -------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar no dia a dia:
   - Link do botão de compra
   - Instagram, nome e fotos
   - Lista de vídeos dos ganhadores (adicione/remova à vontade)
   ========================================================================= */

const CONFIG = {
    // Link para onde o botão verde vai levar (ex.: "https://seusite.com/comprar")
    purchaseUrl: "https://apprf.com/scooter-eletrica-ou-rdollar-500000-no-pix?ref=dk2SMzrJr5",

    // Abrir o link de compra em nova aba? (true = nova aba / false = mesma aba)
    openPurchaseInNewTab: false,

    // Link do grupo VIP no WhatsApp (botão laranja abaixo do botão verde; abre em nova aba)
    whatsappGroupUrl: "https://chat.whatsapp.com/HlxHIwL6a3EC3OYtzUordp",

    // Perfil
    instagramUrl: "https://instagram.com/tiorena7o",
    profileName: "Tio Renato",
    instagramHandle: "tiorena7o",   // texto exibido ao lado do ícone do Instagram

    // Imagens principais
    bannerImage: "assets/images/banner-renato.png",
    // Foto do rodapé (se enviar a original em .webp, troque para "assets/images/perfil-renato.webp")
    profileImage: "assets/images/perfil-renato.png",

    /* ---------------------------------------------------------------------
       NOTIFICAÇÕES (caem no canto da tela, uma de cada vez, em sequência)

       Tipo 1 — aviso do sorteio:
         { title: "Título em negrito", text: "Texto menor" }

       Tipo 2 — compra REAL (use só dados verdadeiros, com autorização):
         { name: "Daniel", qty: 50 }
         -> aparece "Daniel" + "acabou de comprar pacote com 50 números"

         { name: "Daniel", city: "Mambaí - GO", qty: 100 }
         -> aparece "Daniel, de Mambaí - GO" + "acabou de comprar pacote com 100 números"

       ATENÇÃO: não cadastre nomes inventados como se fossem compradores.
       Prova social falsa é propaganda enganosa (CDC, art. 37).
       --------------------------------------------------------------------- */
    notifications: {
        enabled: true,        // false = desliga as notificações
        firstDelay: 4000,     // espera antes da 1ª (milissegundos: 4000 = 4s)
        duration: 5000,       // quanto tempo cada uma fica na tela
        interval: 7000,       // intervalo entre uma e outra

        // Som tocado a cada notificação (troque o arquivo mantendo o nome, ou mude o caminho)
        sound: "assets/audio/notificacao.mp3",
        soundVolume: 0.7,     // volume de 0 (mudo) a 1 (máximo)
        /* EXEMPLOS FICTÍCIOS — SOMENTE PARA TESTE
           Aparecem apenas no seu computador (localhost / arquivo local),
           No site publicado eles NÃO aparecem.
           Para ver o site sem eles no localhost: testMode: false */
        testMode: true,
        testItems: [
            { name: "Daniel",   text: "acabou de adquirir 50 números" },
            { name: "Almir",    text: "adquiriu mais 25 números" },
            { name: "Juliana",  text: "acabou de adquirir 100 números" },
            { name: "Rafael",   text: "adquiriu 30 números" },
            { name: "Patrícia", text: "acabou de adquirir 150 números" },
            { name: "Marcos",   text: "adquiriu mais 20 números" },
            { name: "Fernanda", text: "acabou de adquirir 50 números" },
            { name: "Eduardo",  text: "adquiriu 200 números" },
            { name: "Camila",   text: "acabou de adquirir 25 números" },
            { name: "João",     text: "adquiriu mais 75 números" },
            { name: "Lucas",    text: "acabou de adquirir 40 números" },
            { name: "Antônio",  text: "adquiriu 100 números" },
            { name: "Adriana",  text: "acabou de adquirir 60 números" },
            { name: "Rodrigo",  text: "adquiriu mais 30 números" },
            { name: "Marcelo",  text: "acabou de adquirir 150 números" }
        ],

        // Mensagens do site publicado (avisos + compras REAIS que você adicionar)
        items: [
            { title: "Sorteio de final de ano", text: "Scooter elétrica ou R$ 5.000,00 no PIX" },
            { title: "Dispensa CNH, IPVA e placa", text: "Scooter elétrica pronta para rodar" },
            { title: "Participe agora", text: "Toque no botão verde e garanta seus números" },
            { title: "Acompanhe o sorteio", text: "Entre no grupo e fique por dentro do resultado" }
        ]
    },

    /* ---------------------------------------------------------------------
       VÍDEOS DOS GANHADORES (aparecem um abaixo do outro, nesta ordem)

       Para ADICIONAR um vídeo do YouTube/Shorts, copie um bloco { ... },
       cole no fim da lista (com vírgula entre os blocos) e troque o link.
       A capa é puxada automaticamente do YouTube.

         youtube   -> link do vídeo (Shorts ou normal, pode colar como vier)
         label     -> texto acessível (lido por leitores de tela)
         thumbnail -> (opcional) capa própria, ex.: "assets/images/capa.webp"

       Também funciona com vídeo próprio (.mp4) em vez do YouTube:
         { video: "assets/videos/ganhador-08.mp4",
           thumbnail: "assets/images/ganhador-08.webp",
           label: "Vídeo do ganhador 8" }
       --------------------------------------------------------------------- */
    winners: [
        {
            youtube: "https://youtube.com/shorts/yYNiZRijjGA",
            label: "Vídeo do ganhador 1"
        },
        {
            youtube: "https://youtube.com/shorts/ZVDub-9MBGs",
            label: "Vídeo do ganhador 2"
        },
        {
            youtube: "https://youtube.com/shorts/E0wxWFKQ1kE",
            label: "Vídeo do ganhador 3"
        },
        {
            youtube: "https://youtube.com/shorts/KmaLqB7xClk",
            label: "Vídeo do ganhador 4"
        },
        {
            youtube: "https://youtube.com/shorts/gWzcWxxIG0U",
            label: "Vídeo do ganhador 5"
        },
        {
            youtube: "https://youtube.com/shorts/Cr2cr50zWts",
            label: "Vídeo do ganhador 6"
        },
        {
            youtube: "https://youtube.com/shorts/tdQyJkuUmbA",
            label: "Vídeo do ganhador 7"
        }
    ]
};
