(function () {
  'use strict';
  // This is a translated quick-start guide, not a translation of the game or its item catalogue.
  // All text is bundled locally. Choosing a language never contacts a translation service.
  const S = window.Sirens = window.Sirens || {};
  const STORAGE_KEY = 'after-the-sirens-guide-language-v1';
  const languages = Object.freeze([
    ['en', 'English'], ['zh-Hans', '简体中文'], ['zh-Hant', '繁體中文'],
    ['ja', '日本語'], ['ko', '한국어'], ['id', 'Bahasa Indonesia'],
    ['es', 'Español'], ['pt-BR', 'Português (Brasil)']
  ].map(function (entry) { return Object.freeze(entry); }));
  const catalog = {
    en: {
      title: 'New here? Your first five minutes', language: 'Guide language',
      scope: 'This guide is translated. Game menus, item names and dialogue are currently in English.',
      steps: [
        ['Give yourself room', 'Choose Calm under Survival pressure, then ENTER THE TOWN. Open world lets you explore freely; Rescue gives you a goal: find five radio parts and repair the relay.'],
        ['Search the cabin', 'You start beside supplies. Press E, or tap Use, to collect them. Open Pack with I to inspect, equip and craft.'],
        ['Keep your needs covered', 'Use 1 to eat, 2 to drink and 3 to bandage a wound. The on-screen supply buttons work too. Walk quietly; sprinting and gunfire attract the dead.'],
        ['Make a small plan', 'Follow a road to find supplies, then return to shelter. J opens projects and the field guide. There is no need to learn every recipe at once.']
      ],
      keyboardTitle: 'Keyboard and mouse', keyboard: 'WASD moves; C sneaks; mouse aims; left click or Space attacks. P switches between top-down and first-person views. In first person, W/S moves, A/D strafes and arrow keys or mouse turn.',
      touchTitle: 'Phone and tablet', touch: 'Drag the left side to move. Drag the right side to aim and attack, or tap to strike. Use collects supplies and opens doors; Swap changes weapons. In first person, drag the right side to look. Landscape gives you more room.',
      saveTitle: 'Keep your progress', save: 'Singleplayer saves in this browser. Escape or II pauses and opens Export save: keep a file before changing browsers or clearing storage. Pack and Journal pause singleplayer; a multiplayer world keeps running.'
    },
    'zh-Hans': {
      title: '新手指南：最初五分钟', language: '指南语言',
      scope: '本指南已翻译。游戏菜单、物品名称和对话目前仍为英语。',
      steps: [
        ['先给自己一点余地', '在 Survival pressure 中选择 Calm，再点击 ENTER THE TOWN。Open world 可以自由探索；Rescue 的目标是找到五个无线电零件并修好中继站。'],
        ['搜查小屋', '出生点旁边就有物资。按 E 或轻触 Use 收取。按 I 打开 Pack，查看物品、装备和制作配方。'],
        ['照顾基本需求', '按 1 进食、2 饮水、3 包扎伤口，也可以使用屏幕上的补给按钮。尽量安静移动；奔跑和枪声会吸引丧尸。'],
        ['定一个小目标', '沿着道路寻找物资，再返回庇护所。按 J 查看研究项目和生存指南。不必一次学会所有配方。']
      ],
      keyboardTitle: '键盘和鼠标', keyboard: 'WASD 移动，C 潜行，鼠标瞄准，左键或空格攻击。P 切换俯视和第一人称视角。第一人称下，W/S 前后移动，A/D 横移，方向键或鼠标转向。',
      touchTitle: '手机和平板', touch: '拖动左侧移动；拖动右侧瞄准并攻击，轻点右侧挥击。Use 拾取物资或开门，Swap 切换武器。第一人称下，拖动右侧转动视角。横屏有更大操作空间。',
      saveTitle: '保留进度', save: '单人进度保存在当前浏览器中。按 Escape 或 II 暂停后选择 Export save，换浏览器或清理存储前请导出备份。Pack 和 Journal 会暂停单人游戏；多人世界仍会继续运行。'
    },
    'zh-Hant': {
      title: '新手指南：最初五分鐘', language: '指南語言',
      scope: '本指南已翻譯。遊戲選單、物品名稱和對話目前仍為英語。',
      steps: [
        ['先給自己一點餘地', '在 Survival pressure 中選擇 Calm，再點擊 ENTER THE TOWN。Open world 可以自由探索；Rescue 的目標是找到五個無線電零件並修好中繼站。'],
        ['搜索小屋', '出生點旁邊就有物資。按 E 或輕觸 Use 收取。按 I 開啟 Pack，查看物品、裝備和製作配方。'],
        ['照顧基本需求', '按 1 進食、2 飲水、3 包紮傷口，也可以使用畫面上的補給按鈕。盡量安靜移動；奔跑和槍聲會吸引喪屍。'],
        ['訂一個小目標', '沿著道路尋找物資，再返回庇護所。按 J 查看研究項目和生存指南。不必一次學會所有配方。']
      ],
      keyboardTitle: '鍵盤和滑鼠', keyboard: 'WASD 移動，C 潛行，滑鼠瞄準，左鍵或空白鍵攻擊。P 切換俯視和第一人稱視角。第一人稱下，W/S 前後移動，A/D 橫移，方向鍵或滑鼠轉向。',
      touchTitle: '手機和平板', touch: '拖曳左側移動；拖曳右側瞄準並攻擊，輕點右側揮擊。Use 拾取物資或開門，Swap 切換武器。第一人稱下，拖曳右側轉動視角。橫向螢幕有更大操作空間。',
      saveTitle: '保留進度', save: '單人進度儲存在目前的瀏覽器中。按 Escape 或 II 暫停後選擇 Export save，換瀏覽器或清理儲存空間前請匯出備份。Pack 和 Journal 會暫停單人遊戲；多人世界仍會繼續運作。'
    },
    ja: {
      title: '初めての方へ：最初の5分間', language: 'ガイドの言語',
      scope: 'このガイドのみ翻訳されています。ゲームのメニュー、アイテム名、会話は現在英語です。',
      steps: [
        ['余裕を持って始める', 'Survival pressure で Calm を選び、ENTER THE TOWN を押しましょう。Open world は自由な探索、Rescue は無線機の部品を5個集めて中継局を修理するモードです。'],
        ['小屋を調べる', '開始地点のそばに物資があります。E キー、または Use ボタンで回収しましょう。I キーで Pack を開くと、持ち物の確認、装備、クラフトができます。'],
        ['体調に気を配る', '1 で食事、2 で水分補給、3 で傷の手当てができます。画面の補給ボタンも使えます。静かに歩きましょう。走る音や銃声はゾンビを引き寄せます。'],
        ['小さな目標を決める', '道に沿って物資を探し、拠点へ戻りましょう。J キーで研究やフィールドガイドを開けます。すべてのレシピを一度に覚える必要はありません。']
      ],
      keyboardTitle: 'キーボードとマウス', keyboard: 'WASD で移動、C で忍び歩き、マウスで照準、左クリックまたはスペースで攻撃します。P で俯瞰・一人称視点を切り替えます。一人称では W/S で前後移動、A/D で横移動、矢印キーかマウスで向きを変えます。',
      touchTitle: 'スマートフォンとタブレット', touch: '画面左側をドラッグして移動します。右側をドラッグして照準と攻撃、タップで打撃します。Use で物資回収やドアの操作、Swap で武器変更ができます。一人称では右側のドラッグで視点を動かします。横画面がおすすめです。',
      saveTitle: '進行状況を残す', save: 'シングルプレイはこのブラウザに保存されます。Escape または II で一時停止し、Export save でファイルに保存できます。ブラウザの変更や保存データの削除前に書き出しましょう。Pack と Journal はシングルプレイを停止しますが、マルチプレイの世界は動き続けます。'
    },
    ko: {
      title: '처음이라면: 첫 5분 가이드', language: '가이드 언어',
      scope: '이 가이드만 번역되어 있습니다. 게임 메뉴, 아이템 이름과 대화는 현재 영어입니다.',
      steps: [
        ['여유 있게 시작하기', 'Survival pressure에서 Calm을 선택하고 ENTER THE TOWN을 누르세요. Open world에서는 자유롭게 탐험합니다. Rescue에서는 무전기 부품 5개를 모아 중계기를 수리해야 합니다.'],
        ['오두막 살펴보기', '시작 지점 옆에 보급품이 있습니다. E 키나 Use 버튼으로 챙기세요. I 키로 Pack을 열면 소지품 확인, 장비 착용, 제작을 할 수 있습니다.'],
        ['기본적인 필요 챙기기', '1 키로 먹고, 2 키로 마시고, 3 키로 상처를 치료하세요. 화면의 보급품 버튼도 사용할 수 있습니다. 조용히 걸으세요. 달리기와 총성은 좀비를 끌어들입니다.'],
        ['작은 목표 세우기', '길을 따라 보급품을 찾은 뒤 은신처로 돌아오세요. J 키로 연구와 생존 가이드를 열 수 있습니다. 모든 제작법을 한 번에 익힐 필요는 없습니다.']
      ],
      keyboardTitle: '키보드와 마우스', keyboard: 'WASD로 이동, C로 은신 이동, 마우스로 조준, 왼쪽 클릭이나 스페이스로 공격합니다. P로 탑다운과 1인칭 시점을 전환합니다. 1인칭에서는 W/S로 앞뒤 이동, A/D로 옆걸음, 방향키나 마우스로 방향을 바꿉니다.',
      touchTitle: '휴대폰과 태블릿', touch: '왼쪽을 드래그하면 이동합니다. 오른쪽을 드래그하면 조준하고 공격하며, 탭하면 한 번 공격합니다. Use로 보급품을 줍거나 문을 열고, Swap으로 무기를 바꿉니다. 1인칭에서는 오른쪽을 드래그해 둘러봅니다. 가로 화면이 더 여유롭습니다.',
      saveTitle: '진행 상황 보관하기', save: '싱글플레이는 현재 브라우저에 저장됩니다. Escape 또는 II로 일시 정지한 뒤 Export save로 파일을 내보내세요. 브라우저를 바꾸거나 저장 공간을 지우기 전에 백업하세요. Pack과 Journal은 싱글플레이를 멈추지만, 멀티플레이 세계는 계속 진행됩니다.'
    },
    id: {
      title: 'Baru bermain? Lima menit pertama', language: 'Bahasa panduan',
      scope: 'Hanya panduan ini yang diterjemahkan. Menu, nama barang, dan dialog permainan saat ini berbahasa Inggris.',
      steps: [
        ['Mulai dengan santai', 'Pilih Calm pada Survival pressure, lalu ENTER THE TOWN. Open world memberi kebebasan menjelajah. Dalam Rescue, cari lima komponen radio dan perbaiki stasiun relai.'],
        ['Periksa kabin', 'Ada persediaan di dekat tempat awal. Tekan E atau ketuk Use untuk mengambilnya. Tekan I untuk membuka Pack, memeriksa barang, memakai perlengkapan, dan merakit.'],
        ['Jaga kebutuhan dasar', 'Tekan 1 untuk makan, 2 untuk minum, dan 3 untuk membalut luka. Tombol persediaan di layar juga bisa digunakan. Berjalanlah dengan tenang; lari dan tembakan menarik zombi.'],
        ['Buat rencana kecil', 'Ikuti jalan untuk mencari persediaan, lalu kembali ke tempat berlindung. J membuka proyek riset dan panduan lapangan. Tidak perlu menghafal semua resep sekaligus.']
      ],
      keyboardTitle: 'Keyboard dan mouse', keyboard: 'WASD untuk bergerak, C untuk mengendap, mouse untuk membidik, klik kiri atau Spasi untuk menyerang. P mengganti tampilan atas dan sudut pandang orang pertama. Dalam orang pertama, W/S maju-mundur, A/D bergeser, dan tombol panah atau mouse berputar.',
      touchTitle: 'Ponsel dan tablet', touch: 'Geser sisi kiri untuk bergerak. Geser sisi kanan untuk membidik dan menyerang, atau ketuk untuk memukul. Use mengambil persediaan dan membuka pintu; Swap mengganti senjata. Dalam orang pertama, geser sisi kanan untuk melihat sekeliling. Layar mendatar memberi lebih banyak ruang.',
      saveTitle: 'Simpan kemajuanmu', save: 'Kemajuan pemain tunggal disimpan di browser ini. Tekan Escape atau II untuk menjeda, lalu pilih Export save. Simpan file cadangan sebelum mengganti browser atau menghapus penyimpanan. Pack dan Journal menjeda pemain tunggal; dunia multipemain tetap berjalan.'
    },
    es: {
      title: '¿Primera partida? Tus primeros cinco minutos', language: 'Idioma de la guía',
      scope: 'Solo esta guía está traducida. Los menús, nombres de objetos y diálogos del juego están actualmente en inglés.',
      steps: [
        ['Empieza con calma', 'Elige Calm en Survival pressure y pulsa ENTER THE TOWN. Open world permite explorar libremente; en Rescue debes encontrar cinco piezas de radio y reparar la estación repetidora.'],
        ['Registra la cabaña', 'Empiezas junto a unos suministros. Pulsa E o toca Use para recogerlos. Abre Pack con I para revisar tus objetos, equiparte y fabricar.'],
        ['Cuida tus necesidades', 'Pulsa 1 para comer, 2 para beber y 3 para vendar una herida. También puedes usar los botones de suministros en pantalla. Camina en silencio: correr y disparar atrae a los muertos.'],
        ['Haz un pequeño plan', 'Sigue una carretera para buscar suministros y vuelve al refugio. J abre los proyectos y la guía de campo. No necesitas aprender todas las recetas de golpe.']
      ],
      keyboardTitle: 'Teclado y ratón', keyboard: 'WASD para moverte, C para avanzar sigilosamente, ratón para apuntar y clic izquierdo o Espacio para atacar. P alterna entre vista cenital y primera persona. En primera persona, W/S avanza y retrocede, A/D se desplaza lateralmente y las flechas o el ratón permiten girar.',
      touchTitle: 'Móvil y tableta', touch: 'Arrastra el lado izquierdo para moverte. Arrastra el derecho para apuntar y atacar, o tócalo para dar un golpe. Use recoge suministros y abre puertas; Swap cambia de arma. En primera persona, arrastra el lado derecho para mirar alrededor. La orientación horizontal deja más espacio.',
      saveTitle: 'Conserva tu progreso', save: 'Las partidas individuales se guardan en este navegador. Pulsa Escape o II para pausar y elige Export save. Guarda una copia antes de cambiar de navegador o borrar sus datos. Pack y Journal pausan la partida individual; el mundo multijugador sigue funcionando.'
    },
    'pt-BR': {
      title: 'Primeira vez? Seus primeiros cinco minutos', language: 'Idioma do guia',
      scope: 'Somente este guia está traduzido. Os menus, nomes dos itens e diálogos do jogo estão atualmente em inglês.',
      steps: [
        ['Comece com calma', 'Escolha Calm em Survival pressure e clique em ENTER THE TOWN. Open world permite explorar livremente; em Rescue, encontre cinco peças de rádio e conserte o retransmissor.'],
        ['Vasculhe a cabana', 'Você começa perto de suprimentos. Pressione E ou toque em Use para recolhê-los. Abra Pack com I para conferir os itens, equipar-se e fabricar.'],
        ['Cuide das suas necessidades', 'Pressione 1 para comer, 2 para beber e 3 para enfaixar um ferimento. Os botões de suprimentos na tela também funcionam. Ande em silêncio: correr e atirar atrai os mortos.'],
        ['Faça um plano simples', 'Siga uma estrada para procurar suprimentos e volte ao abrigo. J abre os projetos e o guia de campo. Você não precisa aprender todas as receitas de uma vez.']
      ],
      keyboardTitle: 'Teclado e mouse', keyboard: 'WASD para se mover, C para andar furtivamente, mouse para mirar e clique esquerdo ou Espaço para atacar. P alterna entre a visão de cima e a primeira pessoa. Em primeira pessoa, W/S avança e recua, A/D se move para os lados e as setas ou o mouse permitem virar.',
      touchTitle: 'Celular e tablet', touch: 'Arraste o lado esquerdo para se mover. Arraste o lado direito para mirar e atacar, ou toque para golpear. Use recolhe suprimentos e abre portas; Swap troca de arma. Em primeira pessoa, arraste o lado direito para olhar ao redor. A tela na horizontal oferece mais espaço.',
      saveTitle: 'Guarde seu progresso', save: 'A partida individual é salva neste navegador. Pressione Escape ou II para pausar e escolha Export save. Guarde uma cópia antes de trocar de navegador ou limpar os dados. Pack e Journal pausam a partida individual; o mundo multijogador continua funcionando.'
    }
  };
  for (const entry of Object.values(catalog)) {
    entry.steps.forEach(Object.freeze); Object.freeze(entry.steps); Object.freeze(entry);
  }
  Object.freeze(catalog);

  function resolve(locale) {
    if (typeof locale !== 'string') return null;
    const tag = locale.trim().replace(/_/g, '-').toLowerCase();
    if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(tag)) return null;
    const parts = tag.split('-'), language = parts[0];
    if (language === 'zh') {
      if (parts.includes('hant')) return 'zh-Hant';
      if (parts.includes('hans')) return 'zh-Hans';
      return parts.some(function (part) { return ['tw', 'hk', 'mo'].includes(part); }) ? 'zh-Hant' : 'zh-Hans';
    }
    if (['en', 'ja', 'ko', 'id', 'es'].includes(language)) return language;
    // Brazilian Portuguese is the available Portuguese guide; its selector names that variant explicitly.
    if (language === 'pt') return 'pt-BR';
    // Older browsers may report the former Indonesian language code.
    return language === 'in' ? 'id' : null;
  }

  function detect(preferred, saved) {
    // Only values actually written by this guide override browser preference.
    if (typeof saved === 'string' && Object.prototype.hasOwnProperty.call(catalog, saved)) return saved;
    for (const locale of Array.isArray(preferred) ? preferred : [preferred]) {
      const found = resolve(locale);
      if (found) return found;
    }
    return 'en';
  }

  const mounted = new WeakMap();
  function mount(root, options) {
    if (!root || typeof root.querySelector !== 'function') return null;
    if (mounted.has(root)) return mounted.get(root);
    options = options || {};
    let saved = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (_) {}
    const nav = window.navigator || {};
    let locale = detect(nav.languages || [nav.language], saved);
    const panels = [];
    const make = function (tag, className, text) {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text) el.textContent = text;
      return el;
    };
    const positions = [
      [root.querySelector('.as-title-card'), root.querySelector('[data-ui="start-note"]'), 'title'],
      [root.querySelector('.as-pause'), root.querySelector('.as-pause .as-controls'), 'pause']
    ];
    for (const [parent, anchor, place] of positions) {
      if (!parent) continue;
      const details = make('details', 'as-guide'); details.dataset.guide = place;
      const summary = make('summary'), heading = make('span'), hint = make('small', '', 'Quick start'); hint.lang = 'en';
      summary.append(heading, hint);
      const body = make('div', 'as-guide-body'), label = make('label', 'as-guide-language'), labelText = make('span'), select = make('select');
      select.dataset.guideLanguage = place;
      for (const [code, name] of languages) {
        const option = make('option', '', name); option.value = code; option.lang = code; select.append(option);
      }
      label.append(labelText, select);
      const scope = make('p', 'as-guide-scope'), list = make('ol', 'as-guide-steps'), controls = make('div', 'as-guide-controls');
      body.append(label, scope, list, controls); details.append(summary, body);
      if (place === 'title' && anchor && anchor.parentNode === parent) anchor.after(details);
      else parent.insertBefore(details, anchor && anchor.parentNode === parent ? anchor : null);
      panels.push({ details: details, heading: heading, hint: hint, labelText: labelText, select: select, scope: scope, list: list, controls: controls });
      select.addEventListener('change', function () {
        if (!Object.prototype.hasOwnProperty.call(catalog, select.value) || locale === select.value) return;
        locale = select.value;
        try { window.localStorage.setItem(STORAGE_KEY, locale); } catch (_) {}
        render();
        if (typeof options.onLanguageChange === 'function') {
          try { options.onLanguageChange(locale); } catch (_) {}
        }
      });
    }
    function render() {
      const text = catalog[locale];
      for (const panel of panels) {
        panel.details.lang = locale;
        panel.heading.textContent = text.title; panel.hint.hidden = locale === 'en';
        panel.labelText.textContent = text.language; panel.select.value = locale;
        panel.scope.textContent = text.scope;
        panel.list.replaceChildren();
        for (const [title, description] of text.steps) {
          const item = make('li'), strong = make('strong', '', title), p = make('p', '', description);
          item.append(strong, p); panel.list.append(item);
        }
        panel.controls.replaceChildren();
        for (const kind of ['keyboard', 'touch', 'save']) {
          const section = make('section'), title = make('h3', '', text[kind + 'Title']), p = make('p', '', text[kind]);
          section.append(title, p); panel.controls.append(section);
        }
      }
    }
    const controller = Object.freeze({
      getLocale: function () { return locale; },
      // Programmatic changes are presentation-only and do not count as a player's explicit choice.
      setLocale: function (value) { locale = resolve(value) || 'en'; render(); return locale; }
    });
    render(); mounted.set(root, controller); return controller;
  }
  S.Guide = Object.freeze({ mount: mount, resolve: resolve, detect: detect, catalog: catalog, languages: languages });
})();
