
'use strict';

/* MYF ElectroLab 5.6 — JavaScript completo */

const $ = id => document.getElementById(id);
const fmt = (n, d = 2) =>
  Number(n).toFixed(d).replace('.', ',');

const NS = 'http://www.w3.org/2000/svg';

function S(tag, attrs = {}, content) {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) =>
    e.setAttribute(k, String(v))
  );
  if (content !== undefined) {
    e.textContent = String(content);
  }
  return e;
}

/* ==========================================
   1. FUNDAMENTACIÓN Y PROGRESO
========================================== */

let leccion = 0;
const estudiadas = new Set();

function abrirLeccion(i) {
  leccion = Math.max(0, Math.min(5, i));

  document.querySelectorAll('.leccion')
    .forEach((e, n) => e.hidden = n !== leccion);

  document.querySelectorAll('[data-leccion]')
    .forEach((b, n) => {
      b.classList.toggle('activa', n === leccion);
      b.classList.toggle('completada', estudiadas.has(n));
    });

  $('anteriorLeccion').disabled = leccion === 0;
  $('siguienteLeccion').disabled = leccion === 5;

  $('completarLeccion').textContent =
    estudiadas.has(leccion)
      ? '✓ Lección estudiada'
      : '✓ Marcar como estudiada';
}

function actualizarProgreso() {
  $('textoProgreso').textContent =
    `${estudiadas.size} de 6 lecciones estudiadas`;

  $('rellenoProgreso').style.width =
    `${estudiadas.size / 6 * 100}%`;

  abrirLeccion(leccion);
}

document.querySelectorAll('[data-leccion]').forEach(b => {
  b.onclick = () => abrirLeccion(+b.dataset.leccion);
});

$('anteriorLeccion').onclick = () =>
  abrirLeccion(leccion - 1);

$('siguienteLeccion').onclick = () =>
  abrirLeccion(leccion + 1);

$('completarLeccion').onclick = () => {
  estudiadas.add(leccion);
  actualizarProgreso();
};

document.querySelectorAll('[data-mini]').forEach(b => {
  b.onclick = () => {
    const ok = b.dataset.bien === 'true';
    const p = $('respuestaMini' + b.dataset.mini);

    p.className = 'respuesta ' + (ok ? 'bien' : 'mal');

    p.textContent = b.dataset.mini === '1'
      ? ok
        ? '✓ Correcto. Si R es constante, I es proporcional a V.'
        : '✗ Revisa la fórmula I = V/R.'
      : ok
        ? '✓ Correcto. Puede producirse un cortocircuito.'
        : '✗ Un amperímetro ideal presenta resistencia prácticamente nula.';
  };
});

/* ==========================================
   2. CALCULADORA
========================================== */

let magnitud = 'I';

const config = {
  I: ['I = V/R', 'Voltaje (V)', 'Resistencia (Ω)', 12, 300],
  V: ['V = I × R', 'Corriente (A)', 'Resistencia (Ω)', 0.02, 300],
  R: ['R = V/I', 'Voltaje (V)', 'Corriente (A)', 12, 0.04]
};

function calcular() {
  const a = Number($('dato1').value);
  const b = Number($('dato2').value);

  if (
    !$('dato1').value.trim() ||
    !$('dato2').value.trim() ||
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    a < 0 ||
    b <= 0
  ) {
    $('resultadoCalculadora').textContent =
      'Introduce valores válidos; el segundo dato debe ser mayor que cero.';
    $('pasosCalculadora').textContent =
      'No podemos dividir por cero.';
    return;
  }

  if (magnitud === 'I') {
    $('resultadoCalculadora').textContent =
      `I = ${fmt(a / b, 6)} A = ${fmt(a / b * 1000)} mA`;

    $('pasosCalculadora').textContent =
      `1. V = ${fmt(a)} V; R = ${fmt(b)} Ω. ` +
      `2. I = V/R. 3. Dividimos los dos datos. ` +
      `4. Multiplicamos por 1000 para expresar I en mA.`;
  } else if (magnitud === 'V') {
    $('resultadoCalculadora').textContent =
      `V = ${fmt(a * b, 4)} V`;

    $('pasosCalculadora').textContent =
      `1. I = ${fmt(a, 4)} A; R = ${fmt(b)} Ω. ` +
      `2. V = I·R. 3. Multiplicamos ambos datos y obtenemos voltios.`;
  } else {
    $('resultadoCalculadora').textContent =
      `R = ${fmt(a / b, 4)} Ω`;

    $('pasosCalculadora').textContent =
      `1. V = ${fmt(a)} V; I = ${fmt(b, 4)} A. ` +
      `2. R = V/I. 3. Dividimos y obtenemos ohmios.`;
  }
}

function elegirFormula(tipo) {
  magnitud = tipo;
  const [formula, a, b, x, y] = config[tipo];

  $('formulaSeleccionada').textContent = formula;
  $('etiquetaDato1').textContent = a;
  $('etiquetaDato2').textContent = b;
  $('dato1').value = x;
  $('dato2').value = y;

  document.querySelectorAll('[data-calculo]').forEach(btn => {
    btn.classList.toggle(
      'seleccionado',
      btn.dataset.calculo === tipo
    );
  });

  calcular();
}

document.querySelectorAll('[data-calculo]').forEach(b => {
  b.onclick = () => elegirFormula(b.dataset.calculo);
});

$('dato1').oninput = calcular;
$('dato2').oninput = calcular;

/* ==========================================
   3. BANDAS DE COLORES
========================================== */

const paleta = [
  ['Negro', '#111827'],
  ['Marrón', '#92400e'],
  ['Rojo', '#ef4444'],
  ['Naranja', '#f97316'],
  ['Amarillo', '#eab308'],
  ['Verde', '#16a34a'],
  ['Azul', '#2563eb'],
  ['Violeta', '#7c3aed'],
  ['Gris', '#64748b'],
  ['Blanco', '#ffffff']
];

const colorMultiplicador = e =>
  e === -2
    ? '#c0c0c0'
    : e === -1
      ? '#d4af37'
      : paleta[e][1];

function bandasDe(R) {
  const ex = Math.floor(Math.log10(R)) - 1;
  const dos = Math.round(R / 10 ** ex);
  const n = [Math.floor(dos / 10), dos % 10, ex];

  return {
    n,
    colores: [
      paleta[n[0]][1],
      paleta[n[1]][1],
      colorMultiplicador(ex),
      '#d4af37'
    ]
  };
}

function descodificar() {
  const a = +$('bandaSelect1').value;
  const b = +$('bandaSelect2').value;
  const e = +$('bandaSelect3').value;
  const tol = +$('bandaSelect4').value;

  const R = (10 * a + b) * 10 ** e;

  const colors = [
    paleta[a][1],
    paleta[b][1],
    colorMultiplicador(e),
    tol === 5
      ? '#d4af37'
      : tol === 10
        ? '#c0c0c0'
        : paleta[tol][1]
  ];

  colors.forEach((c, i) => {
    $('colorBanda' + (i + 1)).setAttribute('fill', c);
  });

  $('resultadoResistencia').textContent =
    `${fmt(R)} Ω ±${tol} %`;

  $('intervaloResistencia').textContent =
    `Intervalo: ${fmt(R * (1 - tol / 100))} Ω – ` +
    `${fmt(R * (1 + tol / 100))} Ω`;

  $('explicacionBandas').textContent =
    `Cifras ${a} y ${b}; multiplicador 10^${e}; ` +
    `tolerancia ±${tol} %. Valor nominal ${fmt(R)} Ω.`;
}

for (let i = 1; i <= 4; i++) {
  $('bandaSelect' + i).onchange = descodificar;
}

/* ==========================================
   4. AUTOEVALUACIÓN
========================================== */

$('cuestionario').onsubmit = e => {
  e.preventDefault();

  const preguntas = [...document.querySelectorAll('.pregunta')];

  if (preguntas.some(p => !p.querySelector('input:checked'))) {
    $('resultadoCuestionario').textContent =
      'Responde las seis preguntas antes de corregir.';
    return;
  }

  let aciertos = 0;

  preguntas.forEach(p => {
    const ok =
      p.querySelector('input:checked').value ===
      p.dataset.correcta;

    if (ok) aciertos++;

    p.classList.remove('correcta', 'incorrecta');
    p.classList.add(ok ? 'correcta' : 'incorrecta');

    p.querySelector('.comentario').textContent =
      (ok ? '✓ Correcto. ' : '✗ Revisa: ') +
      p.dataset.explicacion;
  });

  $('resultadoCuestionario').textContent =
    `Puntuación ${aciertos}/6 ` +
    `(${fmt(aciertos / 6 * 100, 1)} %). ` +
    `Lee cada explicación.`;

  if (aciertos === 6) {
    estudiadas.add(5);
    actualizarProgreso();
  }
};

$('reintentar').onclick = () => {
  $('cuestionario').reset();

  document.querySelectorAll('.pregunta').forEach(p => {
    p.classList.remove('correcta', 'incorrecta');
    p.querySelector('.comentario').textContent = '';
  });

  $('resultadoCuestionario').textContent =
    'Contesta nuevamente las seis preguntas.';
};

/* ==========================================
   5. EXPERIMENTOS INDEPENDIENTES
========================================== */

function crearSerie(R) {
  return {
    R,
    V: 0,
    recorrido: new Map([[0, 0]]),
    datos: []
  };
}

const series = {
  R1: crearSerie(300),
  R2: crearSerie(600)
};

let serieActiva = 'R1';
let estado = 'detenido';

const controlV = $('voltaje');
const controlR = $('resistencia');

const actual = () => series[serieActiva];

const datosTodos = () =>
  [...series.R1.datos, ...series.R2.datos]
    .sort((a, b) => a.orden - b.orden);

let contadorMediciones = 0;

function magnitudes(key = serieActiva) {
  const { V, R } = series[key];
  const I = V / R;

  return {
    V,
    R,
    I,
    mA: I * 1000,
    P: V * I
  };
}

function resumenSeries() {
  for (const key of ['R1', 'R2']) {
    $(key === 'R1' ? 'resumenR1' : 'resumenR2').textContent =
      `${series[key].datos.length} mediciones · ` +
      `${series[key].R} Ω · ` +
      `V actual ${fmt(series[key].V, 1)} V`;

    $(key === 'R1' ? 'tarjetaR1' : 'tarjetaR2')
      .classList.toggle('activo', serieActiva === key);

    $(key === 'R1' ? 'resistenciaR1' : 'resistenciaR2')
      .value = series[key].R;
  }
}

function sincronizarSliders() {
  controlV.value = actual().V;
  controlR.value = actual().R;

  resumenSeries();
  actualizarInstrumentos();
  pintarGrafica();
}

function seleccionarSerie(key) {
  if (key === serieActiva) return;

  if (estado === 'pausado') {
    estado = 'detenido';
  }

  serieActiva = key;

  detenerAudio();
  sincronizarSliders();
  programarAudio();

  $('avisoSeries').textContent =
    `Ahora trabajas con ${key} (${actual().R} Ω). ` +
    `Sus mediciones y su recorrido se conservan independientemente.`;
}

$('elegirR1').onclick = () => seleccionarSerie('R1');
$('elegirR2').onclick = () => seleccionarSerie('R2');

function cambiarResistencia(key, nuevo) {
  if (
    !Number.isInteger(nuevo) ||
    nuevo < 10 ||
    nuevo > 1000 ||
    nuevo % 10 !== 0
  ) {
    $('avisoSeries').textContent =
      'Introduce una resistencia entre 10 y 1000 Ω, ' +
      'en múltiplos de 10.';

    sincronizarSliders();
    return;
  }

  const s = series[key];

  if (nuevo === s.R) return;

  if (
    s.datos.length &&
    !confirm(
      `Cambiar ${key} de ${s.R} Ω a ${nuevo} Ω ` +
      `eliminará solamente sus ${s.datos.length} ` +
      `mediciones. ¿Continuar?`
    )
  ) {
    sincronizarSliders();
    return;
  }

  s.R = nuevo;
  s.V = 0;
  s.recorrido = new Map([[0, 0]]);
  s.datos = [];

  $('avisoSeries').textContent =
    `${key} ahora tiene ${nuevo} Ω. ` +
    `Se reinició solo ese experimento; ` +
    `el otro conserva sus datos.`;

  sincronizarSliders();
  pintarTabla();
}

$('resistenciaR1').addEventListener('change', () => {
  cambiarResistencia('R1', Number($('resistenciaR1').value));
});

$('resistenciaR2').addEventListener('change', () => {
  cambiarResistencia('R2', Number($('resistenciaR2').value));
});

controlR.addEventListener('change', () => {
  cambiarResistencia(serieActiva, Number(controlR.value));
});

controlV.addEventListener('input', () => {
  actual().V = Number(controlV.value);

  if (estado === 'activo') {
    actual().recorrido.set(actual().V, magnitudes().mA);
  }

  actualizarInstrumentos();
  resumenSeries();
  pintarGrafica();
  programarAudio();
});

/* ==========================================
   6. INSTRUMENTOS DIGITALES
========================================== */

function actualizarInstrumentos() {
  const { V, R, I, mA, P } = magnitudes();

  $('valorVoltaje').textContent = fmt(V, 1) + ' V';
  $('valorResistencia').textContent = R + ' Ω';
  $('pantallaFuente').textContent = V.toFixed(1) + ' V';
  $('etiquetaResistencia').textContent = 'R = ' + R + ' Ω';
  $('medidorResistencia').textContent = R + ' Ω';

  const bandas = bandasDe(R);

  bandas.colores.forEach((c, i) => {
    $('labBanda' + (i + 1)).setAttribute('fill', c);
  });

  $('coloresTexto').textContent =
    bandas.n.map(n => paleta[n][0]).join(' · ') +
    ' · Dorado';

  if (estado === 'activo') {
    $('pantallaAmperimetro').textContent = mA.toFixed(2);
    $('pantallaVoltimetro').textContent = V.toFixed(2);

    $('medidorVoltaje').textContent = fmt(V) + ' V';
    $('medidorCorriente').textContent = fmt(I, 6) + ' A';
    $('medidorMilliamp').textContent = fmt(mA) + ' mA';
    $('valorPotencia').textContent = fmt(P, 3) + ' W';

    $('circuito').style.setProperty(
      '--velocidad',
      (2.4 - 1.9 * mA / (mA + 45)).toFixed(2) + 's'
    );

    $('circuito').classList.toggle('activo', I > 0);

    $('estadoCircuito').textContent =
      I > 0
        ? `● ${serieActiva} · CORRIENTE CIRCULANDO`
        : '○ CORRIENTE NULA';

    $('estadoSimulacion').textContent =
      `${serieActiva}: corriente calculada ${fmt(mA)} mA`;

    $('avisoPotencia').classList.toggle('visible', P > 0.25);

    $('avisoPotencia').textContent =
      P > 0.25
        ? `⚠ P = ${fmt(P, 3)} W; supera la potencia ` +
          `nominal de una resistencia física de ¼ W.`
        : '';
  } else if (estado === 'detenido') {
    $('circuito').classList.remove('activo');

    $('pantallaAmperimetro').textContent = '0.00';
    $('pantallaVoltimetro').textContent = '0.00';
    $('medidorVoltaje').textContent = '0,00 V';
    $('medidorCorriente').textContent = '0,000000 A';
    $('medidorMilliamp').textContent = '0,00 mA';
    $('valorPotencia').textContent = '0,000 W';

    $('estadoCircuito').textContent =
      '○ SIMULACIÓN DETENIDA';

    $('estadoSimulacion').textContent =
      'Presiona Iniciar para comenzar.';

    $('avisoPotencia').classList.remove('visible');
  } else {
    $('circuito').classList.remove('activo');

    $('estadoCircuito').textContent =
      '⏸ SIMULACIÓN PAUSADA';

    $('estadoSimulacion').textContent =
      'Lecturas congeladas. Presiona Iniciar para continuar.';
  }

  controlV.disabled = estado === 'pausado';
  controlR.disabled = estado === 'pausado';

  actualizarTablero();
}

/* ==========================================
   7. SONIFICACIÓN
========================================== */

let sonido = true;
let audio = null;
let intervaloAudio = null;

function iniciarContextoAudio() {
  const API =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!API) {
    sonido = false;
    $('botonSonido').disabled = true;
    $('botonSonido').textContent = 'Audio no disponible';
    return;
  }

  if (!audio) audio = new API();

  if (audio.state === 'suspended') {
    audio.resume().catch(() => {});
  }
}

function detenerAudio() {
  if (intervaloAudio !== null) {
    clearInterval(intervaloAudio);
  }
  intervaloAudio = null;
}

function nota() {
  if (
    !sonido ||
    estado !== 'activo' ||
    !audio ||
    audio.state !== 'running'
  ) return;

  const { mA } = magnitudes();
  const volumen = +$('volumen').value / 100;

  if (mA <= 0 || volumen <= 0) return;

  const os = audio.createOscillator();
  const gan = audio.createGain();
  const t = audio.currentTime;

  os.type = 'sine';

  os.frequency.value =
    200 + 820 * mA / (mA + 45);

  gan.gain.setValueAtTime(0, t);

  gan.gain.linearRampToValueAtTime(
    .025 * volumen,
    t + .012
  );

  gan.gain.exponentialRampToValueAtTime(
    .0001,
    t + .095
  );

  os.connect(gan);
  gan.connect(audio.destination);

  os.start(t);
  os.stop(t + .11);
}

function programarAudio(inmediato = false) {
  detenerAudio();

  const { mA } = magnitudes();

  if (
    !sonido ||
    estado !== 'activo' ||
    document.hidden ||
    !mA ||
    +$('volumen').value === 0
  ) return;

  if (inmediato) nota();

  intervaloAudio = setInterval(
    nota,
    Math.round(740 - 500 * mA / (mA + 45))
  );
}

$('botonSonido').onclick = () => {
  sonido = !sonido;

  $('botonSonido').textContent =
    sonido ? '🔊 Sonido activado' : '🔇 Silenciado';

  $('botonSonido').setAttribute(
    'aria-pressed',
    String(sonido)
  );

  if (sonido) iniciarContextoAudio();

  programarAudio(true);
};

$('volumen').oninput = () => programarAudio();

document.addEventListener('visibilitychange', () => {
  document.hidden ? detenerAudio() : programarAudio();
});

$('iniciar').onclick = () => {
  estado = 'activo';

  if (sonido) iniciarContextoAudio();

  actual().recorrido.set(
    actual().V,
    magnitudes().mA
  );

  actualizarInstrumentos();
  pintarGrafica();
  programarAudio(true);
};

$('pausar').onclick = () => {
  if (estado !== 'activo') return;

  estado = 'pausado';
  detenerAudio();
  actualizarInstrumentos();
  pintarGrafica();
};

$('reiniciar').onclick = () => {
  estado = 'detenido';
  detenerAudio();

  actual().V = 0;
  actual().recorrido = new Map([[0, 0]]);

  sincronizarSliders();

  $('avisoSeries').textContent =
    `Se reinició la simulación de ${serieActiva}. ` +
    `Sus mediciones registradas se conservan.`;
};

/* ==========================================
   8. REGRESIÓN LINEAL
========================================== */

function ajusteLineal(datos) {
  if (
    datos.length < 2 ||
    new Set(datos.map(d => d.V)).size < 2
  ) return null;

  const n = datos.length;

  const xm =
    datos.reduce((s, d) => s + d.V, 0) / n;

  const ym =
    datos.reduce((s, d) => s + d.mA, 0) / n;

  const sxx =
    datos.reduce(
      (s, d) => s + (d.V - xm) ** 2,
      0
    );

  const sxy =
    datos.reduce(
      (s, d) => s + (d.V - xm) * (d.mA - ym),
      0
    );

  if (sxx < 1e-14) return null;

  const m = sxy / sxx;
  const b = ym - m * xm;

  const sst =
    datos.reduce(
      (s, d) => s + (d.mA - ym) ** 2,
      0
    );

  const sse =
    datos.reduce(
      (s, d) => s + (d.mA - m * d.V - b) ** 2,
      0
    );

  return {
    m,
    b,
    r2: sst < 1e-14
      ? 1
      : Math.max(0, Math.min(1, 1 - sse / sst)),
    R: m > 1e-12 ? 1000 / m : null,
    n
  };
}

function describirSerie(key) {
  const s = series[key];
  const a = ajusteLineal(s.datos);

  if (!a) {
    return (
      `${key}: ${s.R} Ω; ${s.datos.length} mediciones. ` +
      `Registra al menos dos voltajes distintos ` +
      `para calcular la pendiente.`
    );
  }

  const signo = a.b < 0 ? '−' : '+';

  return (
    `${key}: ${s.R} Ω; n = ${a.n}. ` +
    `I = ${fmt(a.m, 4)}·V ${signo} ` +
    `${fmt(Math.abs(a.b), 4)} (mA). ` +
    `Pendiente = ${fmt(a.m, 4)} mA/V. ` +
    `R estimada = ${
      a.R === null
        ? 'No definida'
        : fmt(a.R, 2) + ' Ω'
    }. R² = ${fmt(a.r2, 4)}.`
  );
}

function actualizarAnalisis() {
  for (const key of ['R1', 'R2']) {
    const el = $(key === 'R1' ? 'analisisR1' : 'analisisR2');

    el.replaceChildren();

    const strong = document.createElement('strong');
    strong.textContent =
      `Experimento ${key} · ${series[key].R} Ω`;

    const p = document.createElement('div');
    p.textContent = describirSerie(key);

    el.append(strong, p);
  }

  const p1 = 1000 / series.R1.R;
  const p2 = 1000 / series.R2.R;

  const mayor =
    series.R1.R > series.R2.R
      ? 'R1'
      : series.R2.R > series.R1.R
        ? 'R2'
        : null;

  $('conclusionAutomatica').textContent =
    `Interpretación: R1 tiene pendiente teórica ` +
    `${fmt(p1, 3)} mA/V y R2 tiene ` +
    `${fmt(p2, 3)} mA/V. ` +
    (
      mayor
        ? `${mayor} presenta mayor resistencia y ` +
          `por eso su corriente aumenta más lentamente ` +
          `con el voltaje.`
        : 'Ambas resistencias son iguales, por lo que ' +
          'sus rectas ideales coinciden.'
    ) +
    ' Los ajustes se obtienen de las mediciones ' +
    'simuladas registradas, no de valores físicos medidos.';
}

/* ==========================================
   9. ÚNICA GRÁFICA COMPARATIVA
========================================== */

function polilinea(g, pts, X, Y, color, ancho, dash = '') {
  const p = S('polyline', {
    points: pts.map(
      ([v, i]) => `${X(v)},${Y(i)}`
    ).join(' '),
    fill: 'none',
    stroke: color,
    'stroke-width': ancho,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });

  if (dash) {
    p.setAttribute('stroke-dasharray', dash);
  }

  g.append(p);
}

function pintarGrafica() {
  const g = $('graficaExperimental');

  g.replaceChildren();

  g.append(
    S('rect', {
      x: 0,
      y: 0,
      width: 720,
      height: 390,
      fill: '#0a2138'
    })
  );

  const L = 83;
  const T = 27;
  const W = 606;
  const H = 278;

  const maxI =
    24000 / Math.min(series.R1.R, series.R2.R);

  const X = v => L + v / 24 * W;
  const Y = i => T + H - i / maxI * H;

  // Cuadrícula vertical
  for (let k = 0; k <= 6; k++) {
    const v = 4 * k;

    g.append(
      S('line', {
        x1: X(v),
        y1: T,
        x2: X(v),
        y2: T + H,
        stroke: '#294964'
      })
    );

    g.append(
      S('text', {
        x: X(v),
        y: T + H + 24,
        fill: '#dbeaf6',
        'text-anchor': 'middle',
        'font-size': 13
      }, v)
    );
  }

  // Cuadrícula horizontal
  for (let k = 0; k <= 4; k++) {
    const i = maxI * k / 4;

    g.append(
      S('line', {
        x1: L,
        y1: Y(i),
        x2: L + W,
        y2: Y(i),
        stroke: '#294964'
      })
    );

    g.append(
      S('text', {
        x: L - 9,
        y: Y(i) + 5,
        fill: '#dbeaf6',
        'text-anchor': 'end',
        'font-size': 12
      }, fmt(i, maxI >= 100 ? 0 : 2))
    );
  }

  // Ejes
  g.append(
    S('line', {
      x1: L,
      y1: T,
      x2: L,
      y2: T + H,
      stroke: 'white',
      'stroke-width': 2
    })
  );

  g.append(
    S('line', {
      x1: L,
      y1: T + H,
      x2: L + W,
      y2: T + H,
      stroke: 'white',
      'stroke-width': 2
    })
  );

  g.append(
    S('text', {
      x: 385,
      y: 374,
      fill: 'white',
      'text-anchor': 'middle',
      'font-size': 16
    }, 'Voltaje (V)')
  );

  g.append(
    S('text', {
      x: 18,
      y: 169,
      transform: 'rotate(-90 18 169)',
      fill: 'white',
      'text-anchor': 'middle',
      'font-size': 16
    }, 'Corriente (mA)')
  );

  // Dibujar las series R1 y R2
  for (const key of ['R1', 'R2']) {
    const s = series[key];

    const color =
      key === 'R1' ? '#4ade80' : '#c4b5fd';

    const puntoColor =
      key === 'R1' ? '#facc15' : '#f9a8d4';

    // Modelo ideal
    polilinea(
      g,
      [[0, 0], [24, 24000 / s.R]],
      X,
      Y,
      color,
      2,
      '8 7'
    );

    // Recorrido explorado
    polilinea(
      g,
      [...s.recorrido].sort((a, b) => a[0] - b[0]),
      X,
      Y,
      color,
      4
    );

    // Mediciones registradas
    s.datos.forEach(d => {
      g.append(
        S('circle', {
          cx: X(d.V),
          cy: Y(d.mA),
          r: 7,
          fill: puntoColor,
          stroke: '#0a2138',
          'stroke-width': 2
        })
      );
    });
  }

  // Posición actual
  if (estado === 'activo') {
    const { V, mA } = magnitudes();

    g.append(
      S('circle', {
        cx: X(V),
        cy: Y(mA),
        r: 8,
        fill: 'white',
        stroke: serieActiva === 'R1'
          ? '#4ade80'
          : '#c4b5fd',
        'stroke-width': 3
      })
    );
  }

  $('textoPendiente').textContent =
    `R1: ${fmt(1000 / series.R1.R, 3)} mA/V · ` +
    `R2: ${fmt(1000 / series.R2.R, 3)} mA/V`;

  $('ayudaGrafica').textContent =
    estado === 'activo'
      ? `Trabajas con ${serieActiva}: ` +
        `V = ${fmt(actual().V, 1)} V; ` +
        `I = ${fmt(magnitudes().mA)} mA. ` +
        `Pulsa «Registrar punto».`
      : 'Selecciona R1 o R2, pulsa Iniciar y mueve ' +
        'el voltaje. Cada recorrido se conservará por separado.';

  actualizarAnalisis();
}

$('borrarRecorrido').onclick = () => {
  actual().recorrido = new Map([[0, 0]]);

  if (estado === 'activo') {
    actual().recorrido.set(
      actual().V,
      magnitudes().mA
    );
  }

  pintarGrafica();
};

/* ==========================================
   10. REGISTRO DE DATOS
========================================== */

function pintarTabla() {
  const tbody = $('tablaDatos');

  tbody.replaceChildren();

  const todos = datosTodos();

  if (!todos.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = 7;
    td.textContent = 'No hay mediciones.';

    tr.append(td);
    tbody.append(tr);
  } else {
    todos.forEach(d => {
      const tr = document.createElement('tr');

      [
        d.orden,
        d.serie,
        fmt(d.V),
        d.R,
        fmt(d.I, 6),
        fmt(d.mA),
        fmt(d.P, 3)
      ].forEach(valor => {
        const td = document.createElement('td');

        td.textContent = valor;
        tr.append(td);
      });

      tbody.append(tr);
    });
  }

  resumenSeries();
}

function registrarMedicion() {
  if (estado !== 'activo') {
    $('ayudaGrafica').textContent =
      'Primero presiona Iniciar para registrar un punto.';
    return;
  }

  const d = magnitudes();

  series[serieActiva].datos.push({
    ...d,
    serie: serieActiva,
    orden: ++contadorMediciones
  });

  actual().recorrido.set(d.V, d.mA);

  pintarTabla();
  pintarGrafica();
}

$('registrar').onclick = registrarMedicion;
$('registrarGrafica').onclick = registrarMedicion;

$('limpiarDatos').onclick = () => {
  if (
    datosTodos().length &&
    !confirm('¿Eliminar todas las mediciones de R1 y R2?')
  ) return;

  series.R1.datos = [];
  series.R2.datos = [];

  pintarTabla();
  pintarGrafica();
};

function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = nombre;

  document.body.append(a);
  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}

$('exportar').onclick = () => {
  const datos = datosTodos();

  if (!datos.length) {
    alert('Primero registra mediciones.');
    return;
  }

  const filas = [
    [
      'Numero',
      'Serie',
      'Voltaje (V)',
      'Resistencia (ohm)',
      'Corriente (A)',
      'Corriente (mA)',
      'Potencia (W)'
    ],
    ...datos.map(d => [
      d.orden,
      d.serie,
      fmt(d.V),
      d.R,
      fmt(d.I, 8),
      fmt(d.mA, 4),
      fmt(d.P, 4)
    ])
  ];

  descargarBlob(
    new Blob(
      ['\uFEFF' + filas.map(row => row.join(';')).join('\n')],
      { type: 'text/csv;charset=utf-8' }
    ),
    'MYF_ElectroLab_Datos.csv'
  );
};

/* ==========================================
   11. DESCARGAR GRÁFICA PNG
========================================== */

function serializarGrafica() {
  const copia = $('graficaExperimental').cloneNode(true);

  copia.setAttribute('xmlns', NS);
  copia.setAttribute('width', '720');
  copia.setAttribute('height', '390');

  return new XMLSerializer().serializeToString(copia);
}

$('descargarPNG').onclick = () => {
  const source = serializarGrafica();

  const blob = new Blob(
    [source],
    { type: 'image/svg+xml;charset=utf-8' }
  );

  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');

    canvas.width = 1440;
    canvas.height = 780;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert('No se pudo crear el gráfico PNG.');
      URL.revokeObjectURL(url);
      return;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    canvas.toBlob(png => {
      if (png) {
        descargarBlob(
          png,
          'MYF_ElectroLab_Grafica_IV.png'
        );
      } else {
        alert('Tu navegador no pudo exportar la imagen PNG.');
      }
    }, 'image/png');
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);

    alert('No fue posible convertir la gráfica a PNG.');
  };

  img.src = url;
};

/* ==========================================
   12. REPORTE DESCARGABLE / IMPRIMIBLE
========================================== */

function crearReporteHTML() {
  const datos = datosTodos();

  const filas = datos.map(d => `
    <tr>
      <td>${d.orden}</td>
      <td>${d.serie}</td>
      <td>${fmt(d.V)}</td>
      <td>${d.R}</td>
      <td>${fmt(d.I, 6)}</td>
      <td>${fmt(d.mA)}</td>
      <td>${fmt(d.P, 3)}</td>
    </tr>
  `).join('');

  const grafica = serializarGrafica();
  const a1 = describirSerie('R1');
  const a2 = describirSerie('R2');

  const interpretacion =
    $('conclusionAutomatica').textContent;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte MYF ElectroLab</title>
<style>
body {
  font-family: Arial, sans-serif;
  max-width: 950px;
  margin: auto;
  padding: 28px;
  color: #163047;
}
h1 { color: #0c4872; }
h2 {
  border-bottom: 2px solid #0f749d;
  padding-bottom: 5px;
}
svg {
  width: 100%;
  height: auto;
  border: 1px solid #cbd5e1;
  background: #0a2138;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
th, td {
  border: 1px solid #bbb;
  padding: 8px;
  text-align: center;
}
th { background: #e5edf5; }
p { line-height: 1.6; }
.nota { font-size: 12px; color: #42566c; }
.analisis {
  background: #f0f5f9;
  padding: 13px;
  border-radius: 8px;
}
@page { size: A4; margin: 14mm; }
@media print {
  body { padding: 0; }
  svg { max-height: 125mm; }
}
</style>
</head>
<body>
  <h1>MYF ElectroLab · Reporte de Ley de Ohm</h1>
  <p>
    Universidad Nacional de Chimborazo ·
    Laboratorio didáctico interactivo
  </p>
  <p>
    <strong>Fecha:</strong>
    ${new Date().toLocaleDateString('es-EC')}
  </p>
  <p class="nota">
    Datos de un modelo ideal I = V/R;
    no son mediciones físicas.
  </p>

  <h2>Gráfica comparativa corriente–voltaje</h2>
  ${grafica}

  <h2>Análisis de las series</h2>
  <div class="analisis">
    <p>${a1}</p>
    <p>${a2}</p>
    <p>${interpretacion}</p>
  </div>

  <h2>Registro de valores</h2>
  <table>
    <thead>
      <tr>
        <th>N.º</th>
        <th>Serie</th>
        <th>V (V)</th>
        <th>R (Ω)</th>
        <th>I (A)</th>
        <th>I (mA)</th>
        <th>P (W)</th>
      </tr>
    </thead>
    <tbody>
      ${
        filas ||
        '<tr><td colspan="7">Sin mediciones registradas.</td></tr>'
      }
    </tbody>
  </table>

  <p class="nota">
    Las pendientes estimadas se obtienen por regresión
    lineal de puntos simulados, cuando hay al menos
    dos voltajes distintos por serie. Un R² alto
    no equivale a una validación física del componente.
  </p>
</body>
</html>`;
}

$('descargarReporte').onclick = () => {
  descargarBlob(
    new Blob(
      ['\uFEFF' + crearReporteHTML()],
      { type: 'text/html;charset=utf-8' }
    ),
    'MYF_ElectroLab_Reporte.html'
  );
};

$('imprimirReporte').onclick = () => {
  const w = window.open('', '_blank');

  if (!w) {
    alert(
      'Permite las ventanas emergentes para imprimir ' +
      'el reporte o utiliza Descargar reporte HTML.'
    );
    return;
  }

  w.document.open();
  w.document.write(crearReporteHTML());
  w.document.close();
  w.focus();

  setTimeout(() => w.print(), 350);
};

/* ==========================================
   13. CONSTRUCTOR DE CIRCUITOS
   (SIN GRÁFICA)
========================================== */

const tablero = $('tablero');

const terminales = {
  sPlus: [260, 245],
  sMinus: [260, 320],
  aPlus: [330, 215],
  aMinus: [525, 215],
  rPlus: [620, 215],
  rMinus: [815, 215],
  vPlus: [620, 385],
  vMinus: [815, 385]
};

let cables = [];
let origen = null;
let montajeValido = false;

function construirTablero() {
  tablero.innerHTML = `
    <defs>
      <pattern id="rejillaC"
               width="25" height="25"
               patternUnits="userSpaceOnUse">
        <path d="M25 0H0V25"
              fill="none"
              stroke="white"
              stroke-opacity=".1"/>
      </pattern>
    </defs>

    <rect width="1000" height="460"
          rx="16" fill="#698398"/>

    <rect width="1000" height="460"
          rx="16" fill="url(#rejillaC)"/>

    <g id="cablesDibujados"></g>

    <!-- FUENTE -->
    <rect x="65" y="175"
          width="195" height="185"
          rx="14" class="constructor-carcasa"/>

    <text x="162" y="211"
          class="constructor-titulo">FUENTE DC</text>

    <rect x="85" y="230"
          width="151" height="66"
          rx="8" class="pantalla"/>

    <text id="fuenteConstruida"
          x="162" y="272"
          class="constructor-lectura">0.0 V</text>

    <text x="162" y="328"
          class="constructor-detalle">Voltaje variable</text>

    <circle cx="237" cy="189"
            r="6" class="led-constructor"/>

    <!-- AMPERÍMETRO -->
    <rect x="330" y="85"
          width="195" height="165"
          rx="14" class="constructor-carcasa"/>

    <text x="427" y="120"
          class="constructor-titulo">AMPERÍMETRO</text>

    <rect x="353" y="138"
          width="149" height="68"
          rx="8" class="pantalla"/>

    <text id="amperimetroConstruido"
          x="427" y="180"
          class="constructor-lectura">--.--</text>

    <text x="427" y="230"
          class="constructor-detalle">mA · Serie</text>

    <circle cx="503" cy="100"
            r="6" class="led-constructor"/>

    <!-- RESISTENCIA -->
    <rect x="620" y="85"
          width="195" height="165"
          rx="14" class="constructor-carcasa"/>

    <text x="717" y="120"
          class="constructor-titulo">RESISTENCIA</text>

    <line x1="654" y1="174"
          x2="784" y2="174"
          stroke="#d5dce4" stroke-width="6"/>

    <rect x="680" y="157"
          width="76" height="34"
          rx="12" fill="#e6bd8b"/>

    <rect id="constructorBanda1"
          x="690" y="159" width="7" height="30"/>

    <rect id="constructorBanda2"
          x="706" y="159" width="7" height="30"/>

    <rect id="constructorBanda3"
          x="723" y="159" width="7" height="30"/>

    <rect id="constructorBanda4"
          x="742" y="159" width="6" height="30"/>

    <text id="resistenciaConstruida"
          x="717" y="229"
          class="constructor-detalle">300 Ω</text>

    <!-- VOLTÍMETRO -->
    <rect x="620" y="300"
          width="195" height="130"
          rx="14" class="constructor-carcasa"/>

    <text x="717" y="332"
          class="constructor-titulo">VOLTÍMETRO</text>

    <rect x="644" y="346"
          width="147" height="62"
          rx="8" class="pantalla-clara"/>

    <text id="voltimetroConstruido"
          x="717" y="388"
          class="digitos-oscuros">--.--</text>

    <circle cx="793" cy="316"
            r="6" class="led-constructor"/>

    <g id="bornesInteractivos"></g>
  `;

  for (const [id, [x, y]] of Object.entries(terminales)) {
    const tipo =
      id.endsWith('Plus') ? 'positivo' : 'negativo';

    const signo =
      id.startsWith('r')
        ? id === 'rPlus' ? '1' : '2'
        : id.endsWith('Plus') ? '+' : '−';

    const g = S('g', {
      class: 'terminal',
      'data-borne': id,
      role: 'button',
      tabindex: 0,
      'aria-label': id
    });

    g.append(
      S('circle', {
        cx: x,
        cy: y,
        r: 15,
        class: tipo
      })
    );

    g.append(
      S('text', {
        x,
        y: y + 6
      }, signo)
    );

    $('bornesInteractivos').append(g);
  }

  actualizarTablero();
}

const llave = (a, b) =>
  [a, b].sort().join('|');

function marcarTerminales(errores = []) {
  tablero.querySelectorAll('[data-borne]').forEach(g => {
    g.classList.toggle(
      'seleccionado',
      g.dataset.borne === origen
    );

    g.classList.toggle(
      'error',
      errores.includes(g.dataset.borne)
    );
  });
}

function trazarCables() {
  const capa = $('cablesDibujados');

  capa.replaceChildren();

  cables.forEach(({ a, b }, i) => {
    const [x1, y1] = terminales[a];
    const [x2, y2] = terminales[b];

    const d =
      llave(a, b) === llave('rMinus', 'sMinus')
        ? `M${x1} ${y1} L${x1} 444 L${x2} 444 L${x2} ${y2}`
        : `M${x1} ${y1} C${(x1 + x2) / 2} ${y1},` +
          `${(x1 + x2) / 2} ${y2},${x2} ${y2}`;

    capa.append(
      S('path', {
        d,
        class: 'cable',
        stroke:
          a.endsWith('Plus') || b.endsWith('Plus')
            ? '#df3446'
            : '#182e43',
        'data-cable': i,
        role: 'button',
        tabindex: 0,
        'aria-label': 'Retirar cable'
      })
    );
  });
}

function invalidar(mensaje) {
  montajeValido = false;

  tablero.classList.remove('encendido');

  $('amperimetroConstruido').textContent = '--.--';
  $('voltimetroConstruido').textContent = '--.--';

  $('retroalimentacion').className =
    'recuadro retroalimentacion';

  $('retroalimentacion').textContent =
    'El montaje cambió. Pulsa Comprobar para validarlo.';

  $('estadoCable').textContent = mensaje;

  marcarTerminales();
}

function seleccionarTerminal(id) {
  if (origen === null) {
    origen = id;

    $('estadoCable').textContent =
      'Primer borne elegido. Selecciona el segundo.';

    marcarTerminales();
    return;
  }

  if (origen === id) {
    origen = null;

    $('estadoCable').textContent =
      'Selección cancelada.';

    marcarTerminales();
    return;
  }

  if (
    cables.some(c =>
      llave(c.a, c.b) === llave(origen, id)
    )
  ) {
    origen = null;

    $('estadoCable').textContent =
      'Ese cable ya existe.';

    marcarTerminales();
    return;
  }

  if (cables.length >= 16) {
    origen = null;

    $('estadoCable').textContent = 'Máximo 16 cables.';

    marcarTerminales();
    return;
  }

  cables.push({
    a: origen,
    b: id
  });

  origen = null;

  trazarCables();
  invalidar('Cable añadido.');
}

function accionTablero(el) {
  const t = el.closest('[data-borne]');

  if (t) {
    return seleccionarTerminal(t.dataset.borne);
  }

  const c = el.closest('[data-cable]');

  if (c) {
    cables.splice(+c.dataset.cable, 1);
    origen = null;

    trazarCables();
    invalidar('Cable retirado.');
  }
}

tablero.addEventListener('click', e => {
  accionTablero(e.target);
});

tablero.addEventListener('keydown', e => {
  if (
    (e.key === 'Enter' || e.key === ' ') &&
    e.target.closest('[data-borne],[data-cable]')
  ) {
    e.preventDefault();
    accionTablero(e.target);
  }
});

function conjuntos() {
  const padre = Object.fromEntries(
    Object.keys(terminales).map(x => [x, x])
  );

  function raiz(x) {
    while (padre[x] !== x) {
      padre[x] = padre[padre[x]];
      x = padre[x];
    }
    return x;
  }

  return {
    unir: (a, b) => {
      padre[raiz(a)] = raiz(b);
    },

    igual: (a, b) => raiz(a) === raiz(b)
  };
}

function comprobarTopologia() {
  const red = conjuntos();
  const ideal = conjuntos();

  cables.forEach(c => {
    red.unir(c.a, c.b);
    ideal.unir(c.a, c.b);
  });

  ideal.unir('aPlus', 'aMinus');

  if (
    ideal.igual('sPlus', 'sMinus') ||
    red.igual('rPlus', 'rMinus')
  ) {
    return {
      tipo: 'alerta',
      mensaje:
        '⚠ CORTOCIRCUITO o resistencia puenteada. ' +
        'Revisa la conexión del amperímetro y los puentes.',
      errores: [
        'sPlus', 'sMinus',
        'aPlus', 'aMinus',
        'rPlus', 'rMinus'
      ]
    };
  }

  const patron = grupos =>
    grupos.every(
      g => g.every(t => red.igual(g[0], t))
    ) &&
    grupos.every(
      (g, i) => grupos.slice(i + 1)
        .every(h => !red.igual(g[0], h[0]))
    );

  const antes = patron([
    ['sPlus', 'aPlus'],
    ['aMinus', 'rPlus', 'vPlus'],
    ['rMinus', 'sMinus', 'vMinus']
  ]);

  const despues = patron([
    ['sPlus', 'rPlus', 'vPlus'],
    ['rMinus', 'aPlus', 'vMinus'],
    ['aMinus', 'sMinus']
  ]);

  if (antes || despues) {
    return {
      tipo: 'bien',
      mensaje:
        '✅ MONTAJE CORRECTO. Amperímetro en serie, ' +
        'voltímetro en paralelo y polaridades correctas.',
      errores: []
    };
  }

  const ampAntes =
    red.igual('sPlus', 'aPlus') &&
    red.igual('aMinus', 'rPlus') &&
    red.igual('rMinus', 'sMinus');

  const ampDespues =
    red.igual('sPlus', 'rPlus') &&
    red.igual('rMinus', 'aPlus') &&
    red.igual('aMinus', 'sMinus');

  if (
    (ampAntes || ampDespues) &&
    red.igual('vMinus', 'rPlus') &&
    red.igual('vPlus', 'rMinus')
  ) {
    return {
      tipo: 'mal',
      mensaje:
        '⚠ VOLTÍMETRO INVERTIDO: ' +
        'intercambia los bornes V+ y V−.',
      errores: ['vPlus', 'vMinus']
    };
  }

  if (ampAntes || ampDespues) {
    return {
      tipo: 'mal',
      mensaje:
        '⚠ El circuito principal funciona, pero debes ' +
        'conectar el voltímetro en paralelo: ' +
        'V+ a R1 y V− a R2.',
      errores: ['vPlus', 'vMinus']
    };
  }

  return {
    tipo: 'mal',
    mensaje:
      '⚠ Montaje incompleto. Conecta fuente+ a A+, ' +
      'A− a R1, R2 a fuente−, V+ a R1 y V− a R2.',
    errores: [
      'aPlus', 'aMinus',
      'rPlus', 'rMinus'
    ]
  };
}

function actualizarTablero() {
  if (!$('fuenteConstruida')) return;

  const { V, R, mA } = magnitudes();

  $('fuenteConstruida').textContent =
    V.toFixed(1) + ' V';

  $('resistenciaConstruida').textContent =
    R + ' Ω';

  bandasDe(R).colores.forEach((c, i) => {
    $('constructorBanda' + (i + 1))
      .setAttribute('fill', c);
  });

  if (montajeValido) {
    $('amperimetroConstruido').textContent =
      mA.toFixed(2);

    $('voltimetroConstruido').textContent =
      V.toFixed(2);
  }
}

function comprobarConexiones() {
  const r = comprobarTopologia();
  montageState(r);
}

function montageState(r) {
  montajeValido = r.tipo === 'bien';

  tablero.classList.toggle(
    'encendido',
    montajeValido
  );

  $('retroalimentacion').className =
    'recuadro retroalimentacion ' + r.tipo;

  $('retroalimentacion').textContent =
    r.mensaje;

  marcarTerminales(r.errores);

  if (montajeValido) {
    actualizarTablero();
  } else {
    $('amperimetroConstruido').textContent = '--.--';
    $('voltimetroConstruido').textContent = '--.--';
  }

  $('estadoCable').textContent =
    montajeValido
      ? 'Conexión verificada.'
      : 'Revisa los terminales resaltados.';
}

function ejemplo(arr) {
  cables = arr;
  origen = null;

  trazarCables();
  invalidar('Ejemplo cargado.');
  comprobarConexiones();
}

$('comprobarCircuito').onclick = comprobarConexiones;

$('ejemploCorrecto').onclick = () => ejemplo([
  { a: 'sPlus', b: 'aPlus' },
  { a: 'aMinus', b: 'rPlus' },
  { a: 'rMinus', b: 'sMinus' },
  { a: 'vPlus', b: 'rPlus' },
  { a: 'vMinus', b: 'rMinus' }
]);

$('ejemploPolaridad').onclick = () => ejemplo([
  { a: 'sPlus', b: 'aPlus' },
  { a: 'aMinus', b: 'rPlus' },
  { a: 'rMinus', b: 'sMinus' },
  { a: 'vMinus', b: 'rPlus' },
  { a: 'vPlus', b: 'rMinus' }
]);

$('ejemploCortocircuito').onclick = () => ejemplo([
  { a: 'sPlus', b: 'aPlus' },
  { a: 'aMinus', b: 'sMinus' }
]);

$('quitarCables').onclick = () => {
  cables = [];
  origen = null;

  trazarCables();
  invalidar('Se retiraron los cables.');
};

/* ==========================================
   14. INICIALIZACIÓN
========================================== */

abrirLeccion(0);
actualizarProgreso();
elegirFormula('I');
descodificar();

construirTablero();
trazarCables();
sincronizarSliders();
pintarTabla();

console.log(
  'MYF ElectroLab 5.6 — ' +
  'dos experimentos y descargas activos.'
);
