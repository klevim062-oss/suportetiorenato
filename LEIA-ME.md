# Landing Page — Tio Renato

## Como editar (passo a passo)

### 1. Link do botão verde
Abra `js/config.js` e troque:
```js
purchaseUrl: "INSIRA_O_LINK_AQUI",
```
pelo seu link, por exemplo `"https://seusite.com/comprar"`.

### 2. Imagens
Coloque os arquivos em `assets/images/` **com estes nomes exatos**:

| Arquivo | Uso | Tamanho sugerido |
|---|---|---|
| `banner-renato.webp` | Banner do topo | 1200 × 675 (qualquer proporção funciona, não é cortado) |
| `perfil-renato.webp` | Foto redonda do rodapé | 240 × 240 |
| `ganhador-01.webp` … `ganhador-03.webp` | Capa dos vídeos | 540 × 960 (vertical 9:16) |

Enquanto a imagem não existir, aparece um espaço reservado indicando o nome do arquivo.

### 3. Vídeos
Coloque em `assets/videos/`: `ganhador-01.mp4`, `ganhador-02.mp4`, `ganhador-03.mp4` (vertical, H.264).
Os vídeos só são baixados quando a pessoa clica no card.

### 4. Adicionar mais vídeos
Em `js/config.js`, dentro de `winners: [ ... ]`, copie um bloco e ajuste:
```js
{
    thumbnail: "assets/images/ganhador-04.webp",
    video: "assets/videos/ganhador-04.mp4",
    label: "Vídeo do ganhador 4"
}
```
(Lembre da vírgula entre os blocos.)

### 5. Cores
Todas as cores ficam no topo de `css/style.css`, em `:root`.

## Estrutura
```
index.html          → estrutura da página
css/style.css       → visual e animações
css/responsive.css  → ajustes para celular / tablet / computador
js/config.js        → SUAS CONFIGURAÇÕES (links, nomes, vídeos)
js/main.js          → funcionamento (não precisa mexer)
assets/images/      → imagens .webp
assets/videos/      → vídeos .mp4
```

## Para testar
Basta abrir `index.html` no navegador (duplo clique).
