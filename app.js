/**
 * PENICILLIUM SP. VIRTUAL BIOTECH LAB - ENGINE VERSION 2.3
 * Author: Antigravity AI
 * Year: 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 1. DATA MODELS & SCIENTIFIC CONSTANTS
    // ----------------------------------------------------
    const SPECIES_DATA = {
        chrysogenum: {
            name: "Penicillium sp. Cepa Y-1",
            pigmentName: "Crisogina (Amarillo)",
            colorHex: "#fbbf24", // Gold
            haloColor: "rgba(251, 191, 36, 0.4)",
            myceliumBg: "radial-gradient(circle, #f8fafc 15%, #cbd5e1 45%, #64748b 80%)",
            exudateBg: "#fbbf24",
            peakWavelength: 390,
            secondaryPeak: 275,
            family: "Alcaloides (Derivado Quinazolínico)",
            rf: {
                HexEtOAc: 0.55,
                ChlMeOH: 0.72,
                Agua: 0.0
            }
        },
        purpurogenum: {
            name: "Penicillium sp. Cepa R-5",
            pigmentName: "Purpurogenona (Rojo carmesí)",
            colorHex: "#ef4444", // Crimson Red
            haloColor: "rgba(239, 68, 68, 0.45)",
            myceliumBg: "radial-gradient(circle, #f8fafc 10%, #94a3b8 35%, #334155 70%)",
            exudateBg: "#ef4444",
            peakWavelength: 505,
            secondaryPeak: 280,
            family: "Azafilonas (Policétidos)",
            rf: {
                HexEtOAc: 0.42,
                ChlMeOH: 0.65,
                Agua: 0.0
            }
        },
        strain_orange: {
            name: "Penicillium sp. Cepa GBPI_P155",
            pigmentName: "Mitorubrinol (Naranja)",
            colorHex: "#f97316", // Orange
            haloColor: "rgba(249, 115, 22, 0.4)",
            myceliumBg: "radial-gradient(circle, #fafaf9 15%, #d6d3d1 50%, #78716c 85%)",
            exudateBg: "#f97316",
            peakWavelength: 475,
            secondaryPeak: 270,
            family: "Azafilonas (Mitorubrinas)",
            rf: {
                HexEtOAc: 0.68,
                ChlMeOH: 0.81,
                Agua: 0.0
            }
        }
    };

    const MEDIA_PROFILES = {
        SDA: { name: "Agar Sabouraud (Sólido)", type: "solid", growthCoeff: 1.0, pigmentCoeff: 1.0 },
        YES: { name: "Agar YES (Sólido)", type: "solid", growthCoeff: 0.90, pigmentCoeff: 1.35 },
        PDA: { name: "Agar Papa Dextrosa (Sólido)", type: "solid", growthCoeff: 0.85, pigmentCoeff: 0.80 },
        NA:  { name: "Agar Nutritivo (Sólido)", type: "solid", growthCoeff: 0.25, pigmentCoeff: 0.10 },
        MIN: { name: "Agar Mínimo (Sólido)", type: "solid", growthCoeff: 0.15, pigmentCoeff: 0.10 },
        SDB: { name: "Caldo Sabouraud (Líquido)", type: "liquid", growthCoeff: 0.90, pigmentCoeff: 0.90 },
        NB:  { name: "Caldo Nutritivo (Líquido)", type: "liquid", growthCoeff: 0.20, pigmentCoeff: 0.05 }
    };

    const SOLVENT_EFFICACY = {
        EtOAc: { name: "Acetato de Etilo", coefficient: 0.95, colorLoss: 1.0 },
        MeOH: { name: "Metanol", coefficient: 0.90, colorLoss: 1.0 },
        H2O: { name: "Agua Destilada", coefficient: 0.15, colorLoss: 0.3 },
        Hex: { name: "n-Hexano", coefficient: 0.05, colorLoss: 0.1 }
    };

    // ----------------------------------------------------
    // 2. STATE MANAGER
    // ----------------------------------------------------
    let state = {
        selectedCepa: 'chrysogenum',
        agarMedio: 'SDA',
        mediumType: 'solid',
        temperatura: 25,
        dias: 7,
        
        // Cultivation Yields
        crecimientoMicelial: 0,
        densidadPigmento: 0,
        biomasaCosechada: 0,
        turbidezMedida: 0.0,
        turbidezRealizada: false,
        
        // Extraction
        selectedSolvente: 'EtOAc',
        rendimientoExtraccion: 0,
        extractoColorHex: null,
        
        // TLC
        faseMovilTLC: 'HexEtOAc',
        tlcSiembraRealizada: false,
        tlcCorridaRealizada: false,
        selectedTlcBand: null,
        
        // Spectroscopy
        specBlankCalibrated: false,
        specCuvetteLoaded: false,
        specScanPerformed: false,

        // Microscope
        microZoom: 100, // 100, 400, 1000
        microFocus: 15, // sharp at 50
        selectedMicroSample: 'penicillium_active',
        microLoopId: null,
        
        // Databases
        cuadernoEnsayos: [],
        
        // Questionnaire Responses Database
        cuestionarioRespuestas: {
            1: { texto: '', imagen: '' },
            2: { texto: '', imagen: '' },
            3: { texto: '', imagen: '' },
            4: { texto: '', imagen: '' },
            5: { texto: '', imagen: '' }
        },
        // Temp questionnaire file base64 data holders
        tempQFile: {
            1: '', 2: '', 3: '', 4: '', 5: ''
        }
    };

    // ----------------------------------------------------
    // 3. DOM ELEMENT BINDINGS
    // ----------------------------------------------------
    // Stepper Navigation
    const stepTabs = document.querySelectorAll('.step-tab');
    const panelSections = document.querySelectorAll('.panel-section');

    // Step 1: Cultivo
    const cepaSelect = document.getElementById('cepa-select');
    const tempSlider = document.getElementById('temp-slider');
    const tempVal = document.getElementById('temp-val');
    const diasSlider = document.getElementById('dias-slider');
    const diasVal = document.getElementById('dias-val');
    const btnIncubación = document.getElementById('btn-incubación');
    const btnCosechar = document.getElementById('btn-cosechar');
    const petriAgar = document.getElementById('petri-agar');
    const moldInoculum = document.getElementById('mold-inoculum');
    const pigmentHalo = document.getElementById('pigment-halo');
    
    // Toggles solid vs liquid
    const solidVisualizer = document.getElementById('solid-growth-visualizer');
    const liquidVisualizer = document.getElementById('liquid-growth-visualizer');
    const flaskLiquidLayer = document.getElementById('flask-liquid-layer');
    const pelletsContainer = document.getElementById('mycelium-pellets-container');
    
    // Step 1: Stats, curve and Console
    const statCrecimiento = document.getElementById('stat-crecimiento');
    const statPigmento = document.getElementById('stat-pigmento');
    const barCrecimiento = document.getElementById('bar-crecimiento');
    const barPigmento = document.getElementById('bar-pigmento');
    const cultivoStatusDot = document.getElementById('cultivo-status-dot');
    const cultivoStatusText = document.getElementById('cultivo-status-text');
    const cultivoConsole = document.getElementById('cultivo-console');

    // Step 2: Extracción & Turbidez (RELOCATED SELECTORS)
    const turbidityCardContainer = document.getElementById('turbidity-card-container');
    const turbidityActiveWidget = document.getElementById('turbidity-active-widget');
    const turbidityInactiveWidget = document.getElementById('turbidity-inactive-widget');
    const turbidezVal = document.getElementById('turbidez-val');
    const btnMedirTurbidez = document.getElementById('btn-medir-turbidez');

    const extSummaryCepa = document.getElementById('ext-summary-cepa');
    const extSummaryCrecimiento = document.getElementById('ext-summary-crecimiento');
    const extSummaryBiomasa = document.getElementById('ext-summary-biomasa');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnProcederTlc = document.getElementById('btn-proceder-tlc');
    const extStatusDot = document.getElementById('ext-status-dot');
    const extStatusText = document.getElementById('ext-status-text');
    const extConsole = document.getElementById('ext-console');
    const vortexShaker = document.getElementById('vortex-shaker');
    const tubeUpperPhase = document.getElementById('tube-upper-phase');
    const tubeLowerPhase = document.getElementById('tube-lower-phase');
    const labelUpper = document.getElementById('label-upper');
    const extValRendimiento = document.getElementById('ext-val-rendimiento');
    const extColorIndicator = document.getElementById('ext-color-indicator');
    const extColorHex = document.getElementById('ext-color-hex');
    const tabExtraccion = document.getElementById('tab-extraccion');

    // Step 3: Cromatografía
    const tlcSummaryExtracto = document.getElementById('tlc-summary-extracto');
    const tlcSummarySolvente = document.getElementById('tlc-summary-solvente');
    const tlcSummaryConcentracion = document.getElementById('tlc-summary-concentracion');
    const btnSembrarTlc = document.getElementById('btn-sembrar-tlc');
    const btnCorrerTlc = document.getElementById('btn-correr-tlc');
    const btnProcederEspectro = document.getElementById('btn-proceder-espectro');
    const tlcStatusDot = document.getElementById('tlc-status-dot');
    const tlcStatusText = document.getElementById('tlc-status-text');
    const tlcConsole = document.getElementById('tlc-console');
    const solFront = document.getElementById('sol-front');
    const tlcSpotInitial = document.getElementById('tlc-spot-initial');
    const tlcPlateDiv = document.getElementById('tlc-plate-div');
    const chamberPool = document.getElementById('chamber-pool');
    
    // Step 3: Bands & calculations
    const bandYellow = document.getElementById('band-yellow');
    const bandOrange = document.getElementById('band-orange');
    const bandRed = document.getElementById('band-red');
    const rfActiveBand = document.getElementById('rf-active-band');
    const rfSolutoDist = document.getElementById('rf-soluto-dist');
    const rfFinalVal = document.getElementById('rf-final-val');
    const tabCromatografia = document.getElementById('tab-cromatografia');

    // Step 4: Espectroscopía
    const specSummaryPigmento = document.getElementById('spec-summary-pigmento');
    const specSummarySolvente = document.getElementById('spec-summary-solvente');
    const specSummaryPureza = document.getElementById('spec-summary-pureza');
    const btnSpecBlanco = document.getElementById('btn-spec-blanco');
    const btnSpecMuestra = document.getElementById('btn-spec-muestra');
    const btnSpecScan = document.getElementById('btn-spec-scan');
    const btnProcederMicroscopio = document.getElementById('btn-proceder-microscopio');
    const specStatusDot = document.getElementById('spec-status-dot');
    const specStatusText = document.getElementById('spec-status-text');
    const specConsole = document.getElementById('spec-console');
    const cuvetteLiquid = document.getElementById('cuvette-liquid');
    const cuvetteInner = document.getElementById('cuvette-inner');
    const laserBeamIndicator = document.getElementById('laser-beam-indicator');
    const laserBeamAttenuated = document.getElementById('laser-beam-attenuated');
    const specResWavelength = document.getElementById('spec-res-wavelength');
    const specResAbsorbance = document.getElementById('spec-res-absorbance');
    const specResFamily = document.getElementById('spec-res-family');
    const specResultsBox = document.getElementById('spec-results-box');
    const tabEspectroscopia = document.getElementById('tab-espectroscopia');

    // Step 5: Microscopía
    const zoomButtons = document.querySelectorAll('.zoom-btn');
    const microSampleSelect = document.getElementById('micro-sample-select');
    const focusSlider = document.getElementById('focus-slider');
    const focusVal = document.getElementById('focus-val');
    const microGuideText = document.getElementById('microscope-guide-text');
    const ocularViewElement = document.getElementById('ocular-view-element');
    const focusAlert = document.getElementById('focus-alert');
    const btnProcederBitacora = document.getElementById('btn-proceder-bitacora');
    const microUploadZone = document.getElementById('micro-upload-zone');
    const microUploadInput = document.getElementById('micro-upload-input');
    const tabMicroscopia = document.getElementById('tab-microscopia');

    // Step 6: Bitácora & Galería
    const tableLogsBody = document.getElementById('table-logs-body');
    const btnBorrarBitacora = document.getElementById('btn-borrar-bitacora');
    const uploadZone = document.getElementById('upload-zone');
    const imageUploadInput = document.getElementById('image-upload-input');
    const galleryGrid = document.getElementById('gallery-grid');
    
    // Contaminations DOM
    const contamUploadZone = document.getElementById('contam-upload-zone');
    const contamUploadInput = document.getElementById('contam-upload-input');
    const contamGalleryGrid = document.getElementById('contam-gallery-grid');

    // ----------------------------------------------------
    // 4. STEPPER NAVIGATION LOCKS
    // ----------------------------------------------------
    stepTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            
            // Lock logic
            if (targetId === 'panel-extraccion' && state.biomasaCosechada === 0) {
                alert("🔒 Primero debes cultivar tu Penicillium sp. (Paso 1).");
                return;
            }
            if (targetId === 'panel-cromatografia' && state.rendimientoExtraccion === 0) {
                alert("🔒 Primero debes extraer tus pigmentos fúngicos (Paso 2).");
                return;
            }
            if (targetId === 'panel-espectroscopia' && !state.tlcCorridaRealizada) {
                alert("🔒 Primero debes purificar tus pigmentos en placa TLC (Paso 3).");
                return;
            }
            if (targetId === 'panel-microscopia' && state.crecimientoMicelial === 0) {
                alert("🔒 Primero debes iniciar el cultivo biológico para tener muestras micro (Paso 1).");
                return;
            }

            // Switch tabs
            stepTabs.forEach(t => t.classList.remove('active'));
            panelSections.forEach(panel => panel.classList.remove('active'));

            tab.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                
                // Triggers
                if (targetId === 'panel-bitacora') {
                    initGalleryCanvases();
                    renderQuestionnaire(); // Refresh questionnaire inputs from local storage
                }
                if (targetId === 'panel-espectroscopia' && state.specScanPerformed) {
                    drawSpectroscopyChart();
                }
                if (targetId === 'panel-microscopia') {
                    startMicroscopeLoop();
                } else {
                    stopMicroscopeLoop();
                }
            }
        });
    });

    // ----------------------------------------------------
    // 5. CULTIVATION MODULE (STEP 1) WITH GROWTH KINETICS
    // ----------------------------------------------------
    // Listen for medium choices to toggle solid agar vs liquid broth
    const bindMediumToggleListeners = () => {
        const agarRadios = document.querySelectorAll('input[name="agar-medio"]');
        agarRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const med = e.target.value;
                state.agarMedio = med;
                state.mediumType = MEDIA_PROFILES[med].type;

                // Toggle visualizers
                if (state.mediumType === 'liquid') {
                    solidVisualizer.style.display = "none";
                    liquidVisualizer.style.display = "flex";
                } else {
                    solidVisualizer.style.display = "flex";
                    liquidVisualizer.style.display = "none";
                }
                
                // Reset turbidity states
                state.turbidezMedida = 0.0;
                state.turbidezRealizada = false;
                turbidezVal.innerText = "0.000 OD";
                
                // Redraw empty curve chart with baseline values
                drawGrowthCurveChart();
            });
        });
    };

    tempSlider.addEventListener('input', (e) => {
        tempVal.innerText = `${e.target.value} °C`;
    });

    diasSlider.addEventListener('input', (e) => {
        diasVal.innerText = `${e.target.value} días`;
    });

    btnIncubación.addEventListener('click', () => {
        state.selectedCepa = cepaSelect.value;
        state.temperatura = parseInt(tempSlider.value);
        state.dias = parseInt(diasSlider.value);
        
        const agarRadio = document.querySelector('input[name="agar-medio"]:checked');
        state.agarMedio = agarRadio ? agarRadio.value : 'SDA';
        state.mediumType = MEDIA_PROFILES[state.agarMedio].type;

        // 1. Biological Calculations (Ratkowsky + Nutritional constraints)
        let tempFactor = 0;
        const T = state.temperatura;
        if (T > 5 && T < 37) {
            tempFactor = Math.sin((T - 5) / (32) * Math.PI); 
        } else {
            tempFactor = 0; // thermal death or inactivity
        }

        const medProfile = MEDIA_PROFILES[state.agarMedio];
        const maxTime = state.dias;
        
        // Sigmoidal Logistic growth equation
        const k = 0.85 * tempFactor * medProfile.growthCoeff;
        const t0 = 3.5; // midpoint day
        const Bmax = 100 * tempFactor * medProfile.growthCoeff;
        
        let finalGrowth = 0;
        let finalPigment = 0;

        if (T > 5 && T < 37) {
            const lagFactor = 1 / (1 + Math.exp(-k * (maxTime - t0)));
            finalGrowth = Bmax * lagFactor;
            
            if (maxTime > 8) {
                const autolysisCoeff = 1.0 - (maxTime - 8) * 0.15;
                finalGrowth = finalGrowth * autolysisCoeff;
            }
            
            const pigmentLag = 1 / (1 + Math.exp(-k * (maxTime - (t0 + 1))));
            finalPigment = 95 * tempFactor * medProfile.pigmentCoeff * pigmentLag;
        }

        state.crecimientoMicelial = Math.round(Math.min(Math.max(finalGrowth, 0), 100));
        state.densidadPigmento = Math.round(Math.min(Math.max(finalPigment, 0), 100));
        
        const scaleGrams = state.mediumType === 'liquid' ? 6.5 : 4.5;
        state.biomasaCosechada = parseFloat(((state.crecimientoMicelial / 100) * scaleGrams).toFixed(2));

        // 2. Lock UI controls
        btnIncubación.disabled = true;
        cepaSelect.disabled = true;
        tempSlider.disabled = true;
        diasSlider.disabled = true;
        document.querySelectorAll('input[name="agar-medio"]').forEach(el => el.disabled = true);
        
        cultivoStatusDot.className = "pulse-dot yellow";
        cultivoStatusText.innerText = "Incubando...";
        
        const phaseName = state.mediumType === 'liquid' ? 'Fase líquida sumergida' : 'Placa sólida estéril';
        cultivoConsole.innerText = `[INCUBADOR]: Calentando cámara a ${state.temperatura}°C. Medio inoculado con inóculo de ${SPECIES_DATA[state.selectedCepa].name} (${phaseName})...`;

        // Solid petriagar layer coloring
        if (state.mediumType === 'solid') {
            let agarColor = "radial-gradient(circle, #eab308 0%, #ca8a04 100%)";
            if (state.agarMedio === 'YES') {
                agarColor = "radial-gradient(circle, #fef08a 0%, #ca8a04 100%)";
            } else if (state.agarMedio === 'PDA') {
                agarColor = "radial-gradient(circle, #fcd34d 0%, #b45309 100%)";
            } else if (state.agarMedio === 'NA') {
                agarColor = "radial-gradient(circle, #cbd5e1 0%, #94a3b8 100%)";
            } else if (state.agarMedio === 'MIN') {
                agarColor = "radial-gradient(circle, #fafaf9 0%, #cbd5e1 100%)";
            }
            petriAgar.style.background = agarColor;
        } else {
            // Liquid broth color
            flaskLiquidLayer.style.height = "20%";
            flaskLiquidLayer.style.background = "rgba(251, 191, 36, 0.15)";
            pelletsContainer.innerHTML = '';
        }

        // Animate Growth & Halos over a 2.5 second virtual incubation period
        const maxColonySize = (state.crecimientoMicelial / 100) * 165;
        const maxHaloSize = (state.densidadPigmento / 100) * 215;

        // 3. Animate Growth Curve point by point and dynamic visualizers
        drawGrowthCurveChart(true, k, t0, Bmax);

        setTimeout(() => {
            cultivoConsole.innerText += `\n[FISIOLOGÍA]: Esporas germinando. Fase Lag superada. Hifas activando elongación celular.`;
            
            if (state.mediumType === 'solid') {
                moldInoculum.style.width = `${maxColonySize}px`;
                moldInoculum.style.height = `${maxColonySize}px`;
                moldInoculum.style.background = SPECIES_DATA[state.selectedCepa].myceliumBg;

                if (state.densidadPigmento > 5) {
                    pigmentHalo.style.width = `${maxHaloSize}px`;
                    pigmentHalo.style.height = `${maxHaloSize}px`;
                    pigmentHalo.style.background = SPECIES_DATA[state.selectedCepa].haloColor;
                }
            } else {
                flaskLiquidLayer.style.height = `${30 + (state.crecimientoMicelial / 100) * 15}%`;
                
                if (state.densidadPigmento > 5) {
                    const tintColor = hexToRGBA(SPECIES_DATA[state.selectedCepa].colorHex, (state.densidadPigmento / 100) * 0.45);
                    flaskLiquidLayer.style.background = tintColor;
                }

                const pelletCount = Math.round((state.crecimientoMicelial / 100) * 12);
                spawnFlaskPellets(pelletCount, SPECIES_DATA[state.selectedCepa].colorHex);
            }
        }, 300);

        setTimeout(() => {
            // Update stats
            statCrecimiento.innerText = `${state.crecimientoMicelial}%`;
            barCrecimiento.style.width = `${state.crecimientoMicelial}%`;
            statPigmento.innerText = `${state.densidadPigmento}%`;
            barPigmento.style.width = `${state.densidadPigmento}%`;

            if (state.crecimientoMicelial === 0) {
                cultivoStatusDot.className = "pulse-dot red";
                cultivoStatusText.innerText = "Inhibido";
                cultivoConsole.innerText += `\n[ADVERTENCIA]: El estrés térmico o la carencia nutricional detuvieron el crecimiento celular (Biomasa viable = 0g).`;
            } else {
                cultivoStatusDot.className = "pulse-dot green";
                cultivoStatusText.innerText = "Crecimiento Exitoso";
                cultivoConsole.innerText += `\n[SISTEMA]: Ciclo de ${state.dias} días finalizado. Cosecha lista. Presione "Cosechar Biomasa y Continuar" para analizarla en la siguiente sección.`;
                
                btnCosechar.disabled = false;
            }
        }, 2500);
    });

    const spawnFlaskPellets = (count, color) => {
        pelletsContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const pellet = document.createElement('div');
            pellet.className = "pellet-spore";
            
            const size = 5 + Math.random() * 8;
            pellet.style.width = `${size}px`;
            pellet.style.height = `${size}px`;
            pellet.style.background = `radial-gradient(circle, #cbd5e1 30%, ${color} 90%)`;
            pellet.style.left = `${10 + Math.random() * 80}%`;
            pellet.style.bottom = `${10 + Math.random() * 70}%`;
            pellet.style.animationDelay = `${Math.random() * 2}s`;
            pellet.style.animationDuration = `${2.5 + Math.random() * 2}s`;
            
            pelletsContainer.appendChild(pellet);
        }
    };

    // ----------------------------------------------------
    // IMPROVED: Growth kinetics curves solver with 4 colored phases and custom gradient
    // ----------------------------------------------------
    const drawGrowthCurveChart = (animate = false, k = 0.5, t0 = 3.5, Bmax = 90) => {
        const canvas = document.getElementById('canvas-curva-crecimiento');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0,0,w,h);

        const padLeft = 32;
        const padRight = 12;
        const padTop = 15;
        const padBottom = 22;

        const cw = w - padLeft - padRight;
        const ch = h - padTop - padBottom;

        // Background styling
        ctx.fillStyle = "#090d16";
        ctx.fillRect(padLeft, padTop, cw, ch);

        // Draw grid lines
        ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        
        for (let day = 0; day <= 10; day += 2) {
            const x = padLeft + (day / 10) * cw;
            ctx.beginPath();
            ctx.moveTo(x, padTop);
            ctx.lineTo(x, padTop + ch);
            ctx.stroke();

            ctx.fillStyle = "#64748b";
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.textAlign = "center";
            ctx.fillText(`${day}d`, x, padTop + ch + 12);
        }

        const ticks = [0, 50, 100];
        ticks.forEach(pct => {
            const y = padTop + ch - (pct / 100) * ch;
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + cw, y);
            ctx.stroke();

            ctx.fillStyle = "#64748b";
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.textAlign = "right";
            ctx.fillText(`${pct}%`, padLeft - 6, y + 3);
        });
        ctx.setLineDash([]); // Reset line dash

        // Draw 4 growth phases background colors and text labels
        const phaseZones = [
            { xStart: 0, xEnd: 2.0, color: "rgba(100, 116, 139, 0.05)", label: "LAG" },
            { xStart: 2.0, xEnd: 6.0, color: "rgba(16, 185, 129, 0.04)", label: "LOG / EXPONENCIAL" },
            { xStart: 6.0, xEnd: 8.0, color: "rgba(245, 158, 11, 0.04)", label: "ESTACIONARIA" },
            { xStart: 8.0, xEnd: 10.0, color: "rgba(239, 68, 68, 0.04)", label: "DECLINACIÓN" }
        ];

        phaseZones.forEach(zone => {
            const x1 = padLeft + (zone.xStart / 10) * cw;
            const x2 = padLeft + (zone.xEnd / 10) * cw;
            
            // Draw background fill
            ctx.fillStyle = zone.color;
            ctx.fillRect(x1, padTop, x2 - x1, ch);

            // Draw dotted divider lines
            ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
            ctx.lineWidth = 0.75;
            ctx.setLineDash([1, 4]);
            ctx.beginPath();
            ctx.moveTo(x2, padTop);
            ctx.lineTo(x2, padTop + ch);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw top label
            ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
            ctx.font = "500 7px 'Outfit', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(zone.label, x1 + (x2 - x1)/2, padTop - 5);
        });

        // Kinetic solver curve points
        const getBiomass = (t) => {
            if (Bmax < 5) return 0;
            let B = Bmax / (1 + Math.exp(-k * (t - t0)));
            if (t > 8) {
                const autolysis = 1.0 - (t - 8) * 0.15;
                B = B * autolysis;
            }
            return Math.min(Math.max(B, 0), 100);
        };

        const points = [];
        for (let t = 0; t <= 10; t += 0.1) {
            const x = padLeft + (t / 10) * cw;
            const B = getBiomass(t);
            const y = padTop + ch - (B / 100) * ch;
            points.push({ x, y, t, B });
        }

        // Active strain glowing color
        const activeStrainColor = SPECIES_DATA[state.selectedCepa]?.colorHex || "#10b981";

        if (animate) {
            let limit = 0;
            const animInterval = setInterval(() => {
                if (limit < points.length) {
                    const slice = points.slice(0, limit + 1);
                    
                    // Clear only graph area to redraw grid dynamically
                    ctx.fillStyle = "#090d16";
                    ctx.fillRect(padLeft, padTop, cw, ch);

                    // Re-fill grid regions and lines
                    phaseZones.forEach(zone => {
                        const x1 = padLeft + (zone.xStart / 10) * cw;
                        const x2 = padLeft + (zone.xEnd / 10) * cw;
                        ctx.fillStyle = zone.color;
                        ctx.fillRect(x1, padTop, x2 - x1, ch);

                        ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
                        ctx.lineWidth = 0.5;
                        ctx.setLineDash([1, 4]);
                        ctx.beginPath();
                        ctx.moveTo(x2, padTop);
                        ctx.lineTo(x2, padTop + ch);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    });

                    ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
                    ctx.lineWidth = 1;
                    ctx.setLineDash([3, 3]);
                    for (let day = 2; day <= 8; day += 2) {
                        const x = padLeft + (day / 10) * cw;
                        ctx.beginPath();
                        ctx.moveTo(x, padTop);
                        ctx.lineTo(x, padTop + ch);
                        ctx.stroke();
                    }
                    ticks.forEach(pct => {
                        const y = padTop + ch - (pct / 100) * ch;
                        ctx.beginPath();
                        ctx.moveTo(padLeft, y);
                        ctx.lineTo(padLeft + cw, y);
                        ctx.stroke();
                    });
                    ctx.setLineDash([]);

                    // Draw glowing gradient fill under curve
                    const fillGrad = ctx.createLinearGradient(padLeft, padTop, padLeft, padTop + ch);
                    fillGrad.addColorStop(0, hexToRGBA(activeStrainColor, 0.15));
                    fillGrad.addColorStop(1, "rgba(9, 13, 22, 0.0)");
                    
                    ctx.fillStyle = fillGrad;
                    ctx.beginPath();
                    ctx.moveTo(slice[0].x, padTop + ch);
                    for (let i = 0; i < slice.length; i++) {
                        ctx.lineTo(slice[i].x, slice[i].y);
                    }
                    ctx.lineTo(slice[slice.length - 1].x, padTop + ch);
                    ctx.closePath();
                    ctx.fill();

                    // Draw glowing curve line
                    ctx.strokeStyle = activeStrainColor;
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = activeStrainColor;
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.moveTo(slice[0].x, slice[0].y);
                    for (let i = 1; i < slice.length; i++) {
                        ctx.lineTo(slice[i].x, slice[i].y);
                    }
                    ctx.stroke();
                    ctx.shadowBlur = 0; // reset

                    // Draw pulsating cursor node
                    const head = slice[slice.length - 1];
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle = activeStrainColor;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(head.x, head.y, 4.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Console updates during growth animation
                    let odString = "";
                    if (state.mediumType === 'liquid') {
                        const currentOd = (head.B / 100) * (state.agarMedio === 'SDB' ? 1.45 : 0.20);
                        odString = ` | Turbidez OD: ${currentOd.toFixed(3)}`;
                    }
                    
                    let phaseString = "Fase Lag (Germinación)";
                    if (head.t > 2.0 && head.t <= 6.0) phaseString = "Fase Log (Crecimiento Exponencial)";
                    else if (head.t > 6.0 && head.t <= 8.0) phaseString = "Fase Estacionaria (Síntesis de Pigmentos)";
                    else if (head.t > 8.0) phaseString = "Fase de Declinación (Lisis y Autólisis)";

                    cultivoConsole.innerText = `[INCUBADOR]: Día virtual ${head.t.toFixed(1)} de 10. Biomasa: ${head.B.toFixed(1)}% | ${phaseString}${odString}.`;

                    limit += 1;
                } else {
                    clearInterval(animInterval);
                }
            }, 25);
        } else {
            // Draw static glowing fill under curve
            const fillGrad = ctx.createLinearGradient(padLeft, padTop, padLeft, padTop + ch);
            fillGrad.addColorStop(0, hexToRGBA(activeStrainColor, 0.12));
            fillGrad.addColorStop(1, "rgba(9, 13, 22, 0.0)");
            
            ctx.fillStyle = fillGrad;
            ctx.beginPath();
            ctx.moveTo(points[0].x, padTop + ch);
            for (let i = 0; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(points[points.length - 1].x, padTop + ch);
            ctx.closePath();
            ctx.fill();

            // Draw curve line
            ctx.strokeStyle = activeStrainColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        }
    };

    // ----------------------------------------------------
    // RELOCATED & UPDATED: TURBIDITY ANALYSIS (QC STAGE - STEP 2)
    // ----------------------------------------------------
    btnCosechar.addEventListener('click', () => {
        extSummaryCepa.innerText = SPECIES_DATA[state.selectedCepa].name;
        
        let mediumInfo = MEDIA_PROFILES[state.agarMedio].name;
        extSummaryCrecimiento.innerText = `Biomasa: ${state.crecimientoMicelial}%, ${mediumInfo}`;
        extSummaryBiomasa.innerText = `${state.biomasaCosechada} g`;
        
        tabExtraccion.classList.add('unlocked');
        tabMicroscopia.classList.add('unlocked');
        
        // Setup pre-extraction QC card depending on solid or liquid sustrate
        if (state.mediumType === 'liquid') {
            turbidityActiveWidget.style.display = "block";
            turbidityInactiveWidget.style.display = "none";
            btnFiltrar.disabled = true; // Block centrifuge button until turbidimetry QC is run!
            
            // Clear previous readings
            state.turbidezMedida = 0.0;
            state.turbidezRealizada = false;
            turbidezVal.innerText = "0.000 OD";
            turbidezVal.style.color = "var(--neon-cyan)";
        } else {
            turbidityActiveWidget.style.display = "none";
            turbidityInactiveWidget.style.display = "block";
            btnFiltrar.disabled = false; // Enabled immediately since solid agar doesn't support turbidimetry
            
            state.turbidezMedida = 0.0;
            state.turbidezRealizada = false;
        }

        // Navigate to Step 2
        document.getElementById('tab-extraccion').click();
    });

    btnMedirTurbidez.addEventListener('click', () => {
        btnMedirTurbidez.disabled = true;
        extStatusText.innerText = "Midiendo Turbidez...";
        extStatusDot.className = "pulse-dot yellow";
        extConsole.innerText = `[ESPECTROFOTÓMETRO QC]: Inicializando haz óptico. Calibrando longitud de onda a 600 nm con blanco de control...`;
        
        setTimeout(() => {
            let odVal = 0.0;
            const growthRatio = state.crecimientoMicelial / 100.0;
            
            if (state.agarMedio === 'SDB') {
                odVal = growthRatio * (1.35 + Math.random() * 0.25);
            } else if (state.agarMedio === 'NB') {
                odVal = growthRatio * (0.16 + Math.random() * 0.08);
            }
            
            state.turbidezMedida = parseFloat(odVal.toFixed(3));
            state.turbidezRealizada = true;
            
            turbidezVal.innerText = `${state.turbidezMedida.toFixed(3)} OD`;
            
            extStatusDot.className = "pulse-dot green";
            extStatusText.innerText = "Calidad Verificada";
            
            extConsole.innerText += `\n[ANALIZADOR ESPECTRAL]: Muestra medida a OD₆₀₀ = ${state.turbidezMedida.toFixed(3)} OD. `;
            
            if (state.agarMedio === 'SDB') {
                extConsole.innerText += `\n[CRITERIO CIENTÍFICO]: Alta turbidez y absorción debido al denso entramado fúngico de pellets e hifas en suspensión, coherente con la optimización de fermentación sumergida de Gunasekaran & Poorniammal (2008).`;
            } else {
                extConsole.innerText += `\n[CRITERIO CIENTÍFICO]: Lectura crítica de baja densidad óptica celular. Denota una notable inhibición del crecimiento bacteriano/fúngico debido a pH y limitación nutricional nitrogenada.`;
            }

            // Update extraction summary row with turbidity result
            const medInfo = MEDIA_PROFILES[state.agarMedio].name + ` (Turbidez: ${state.turbidezMedida.toFixed(3)} OD)`;
            extSummaryCrecimiento.innerText = `Biomasa: ${state.crecimientoMicelial}%, ${medInfo}`;

            // Unlock next stage: Homogenize and Centrifuge
            btnFiltrar.disabled = false;
        }, 1500);
    });

    // ----------------------------------------------------
    // 6. EXTRACTION PROTOCOL (STEP 2)
    // ----------------------------------------------------
    btnFiltrar.addEventListener('click', () => {
        const solventRadio = document.querySelector('input[name="solvente-select"]:checked');
        state.selectedSolvente = solventRadio ? solventRadio.value : 'EtOAc';

        vortexShaker.classList.add('vortex-shaking');
        btnFiltrar.disabled = true;
        document.querySelectorAll('input[name="solvente-select"]').forEach(el => el.disabled = true);
        
        extStatusDot.className = "pulse-dot yellow";
        extStatusText.innerText = "Mezclando solventes...";
        extConsole.innerText = `[EXTRACTOR]: Licuando micelio septado. Adicionando solvente extractor: ${SOLVENT_EFFICACY[state.selectedSolvente].name}...`;

        setTimeout(() => {
            extConsole.innerText += `\n[CENTRIFUGA]: Agitando a 4000 rpm durante 10 minutos. Separando pellets residuales...`;
        }, 1000);

        setTimeout(() => {
            vortexShaker.classList.remove('vortex-shaking');
            
            const solData = SOLVENT_EFFICACY[state.selectedSolvente];
            const rawYield = (state.densidadPigmento / 100) * solData.coefficient * 100;
            state.rendimientoExtraccion = parseFloat(rawYield.toFixed(2));

            let solventColor = "rgba(255, 255, 255, 0.05)";
            let finalColorHex = "#Ninguno";
            
            if (state.rendimientoExtraccion > 5) {
                const pigmentHex = SPECIES_DATA[state.selectedCepa].colorHex;
                finalColorHex = pigmentHex;
                const transparency = (state.rendimientoExtraccion / 100) * solData.colorLoss;
                solventColor = hexToRGBA(pigmentHex, Math.max(transparency, 0.15));
            }
            
            state.extractoColorHex = finalColorHex;

            tubeUpperPhase.style.height = "50%";
            tubeUpperPhase.style.background = solventColor;
            labelUpper.innerText = `Fase Orgánica: ${state.selectedSolvente}`;
            labelUpper.style.color = "#ffffff";
            
            tubeLowerPhase.style.height = "25%";
            tubeLowerPhase.style.background = "#334155";

            extValRendimiento.innerText = `${state.rendimientoExtraccion} %`;
            extColorIndicator.style.background = finalColorHex === "#Ninguno" ? "transparent" : finalColorHex;
            extColorHex.innerText = finalColorHex;

            extStatusDot.className = "pulse-dot green";
            extStatusText.innerText = "Extracción finalizada";
            extConsole.innerText += `\n[ANALIZADOR]: Rendimiento del extracto orgánico: ${state.rendimientoExtraccion}%.`;
            
            if (state.selectedSolvente === 'H2O' || state.selectedSolvente === 'Hex') {
                extConsole.innerText += `\n[FISICOQUÍMICA]: Se observa muy baja extracción por desajuste de polaridad molar (${solData.name}). Las azafilonas son hidrófobas.`;
            } else {
                extConsole.innerText += `\n[FISICOQUÍMICA]: Extracción óptima mella de enlaces. Pigmento recuperado solubilizado en fase líquida superior.`;
            }

            btnProcederTlc.disabled = false;
        }, 2500);
    });

    btnProcederTlc.addEventListener('click', () => {
        tlcSummaryExtracto.innerText = SPECIES_DATA[state.selectedCepa].pigmentName;
        tlcSummarySolvente.innerText = SOLVENT_EFFICACY[state.selectedSolvente].name;
        
        const conc = (state.rendimientoExtraccion / 100) * 1.5;
        tlcSummaryConcentracion.innerText = `${conc.toFixed(2)} mg/mL`;

        tabCromatografia.classList.add('unlocked');
        document.getElementById('tab-cromatografia').click();
    });

    // ----------------------------------------------------
    // 7. CHROMATOGRAPHY (TLC) WITH CORRECT R_F SUB notation
    // ----------------------------------------------------
    btnSembrarTlc.addEventListener('click', () => {
        state.tlcSiembraRealizada = true;
        tlcSpotInitial.style.display = "block";
        
        const spotColor = state.extractoColorHex === "#Ninguno" ? "#94a3b8" : state.extractoColorHex;
        tlcSpotInitial.style.background = spotColor;
        
        btnSembrarTlc.disabled = true;
        btnCorrerTlc.disabled = false;
        
        tlcStatusText.innerText = "Surgiendo capilar...";
        tlcConsole.innerText = `[CROMATOGRAMA]: Siembra realizada con capilar de vidrio en la línea de origen de sílice gel. Fase móvil lista. Inicia elución...`;
    });

    btnCorrerTlc.addEventListener('click', () => {
        btnCorrerTlc.disabled = true;
        document.querySelectorAll('input[name="fase-movil"]').forEach(el => el.disabled = true);
        
        const faseMovilRadio = document.querySelector('input[name="fase-movil"]:checked');
        state.faseMovilTLC = faseMovilRadio ? faseMovilRadio.value : 'HexEtOAc';

        tlcStatusDot.className = "pulse-dot yellow";
        tlcStatusText.innerText = "Corriendo elución...";
        tlcConsole.innerText = `[CÁMARA TLC]: Eluyendo fase móvil (${faseMovilRadio.nextElementSibling.querySelector('.radio-title').innerText})...`;

        // Animate solvent eluting front
        solFront.style.display = "block";
        chamberPool.style.height = "12px";
        
        // Solvent Front rises to 90% (top of silica)
        setTimeout(() => {
            solFront.style.bottom = "85%";
        }, 100);

        // Bands Separation depending on eluting phase
        const activeStrain = SPECIES_DATA[state.selectedCepa];
        const targetRf = activeStrain.rf[state.faseMovilTLC];

        setTimeout(() => {
            tlcSpotInitial.style.opacity = "0.2";
            
            if (targetRf > 0.05 && state.rendimientoExtraccion > 15) {
                // Rise bands to their calculated Rf relative height
                const tlcBottomPercent = 15 + (targetRf * 70); // origin is 15%, solvent front limit is 85%
                
                let bandElement = null;
                if (state.selectedCepa === 'chrysogenum') bandElement = bandYellow;
                else if (state.selectedCepa === 'strain_orange') bandElement = bandOrange;
                else if (state.selectedCepa === 'purpurogenum') bandElement = bandRed;

                if (bandElement) {
                    bandElement.style.display = "block";
                    setTimeout(() => {
                        bandElement.style.bottom = `${tlcBottomPercent}%`;
                    }, 50);
                    
                    // Bind click for Rf calculator
                    bandElement.onclick = () => {
                        state.selectedTlcBand = state.selectedCepa;
                        
                        rfActiveBand.innerText = activeStrain.pigmentName;
                        rfActiveBand.style.color = activeStrain.colorHex;
                        
                        const solDist = 8.00;
                        const bandDist = parseFloat((targetRf * solDist).toFixed(2));
                        
                        rfSolutoDist.innerText = `${bandDist.toFixed(2)} cm`;
                        rfFinalVal.innerText = targetRf.toFixed(2);
                        
                        tlcConsole.innerText = `[ANÁLISIS]: Banda purificada seleccionada. Distancia soluto = ${bandDist}cm. Rf calculado = ${targetRf}. Proceda a la celda espectral.`;
                        btnProcederEspectro.disabled = false;
                    };
                }
            } else {
                tlcConsole.innerText += `\n[ADVERTENCIA]: Fase móvil incompatible. No se observa migración celular o eluyente arrastró la muestra al frente.`;
                btnProcederEspectro.disabled = false; // allow bypass to avoid dead ends
            }

            tlcStatusDot.className = "pulse-dot green";
            tlcStatusText.innerText = "Corrida Completada";
            tlcConsole.innerText += `\n[CÁMARA TLC]: Frente del solvente alcanzado a 8.00 cm de altura. Seleccione las bandas de pigmento con un clic para medir su factor Rf.`;
            
            state.tlcCorridaRealizada = true;
        }, 3000);
    });

    btnProcederEspectro.addEventListener('click', () => {
        specSummaryPigmento.innerText = state.selectedTlcBand ? SPECIES_DATA[state.selectedTlcBand].pigmentName : "Muestra Cruda";
        specSummarySolvente.innerText = SOLVENT_EFFICACY[state.selectedSolvente].name;
        
        const pureza = state.selectedTlcBand ? 96 : 35;
        specSummaryPureza.innerText = `${pureza}% (Pureza de Fracción)`;

        tabEspectroscopia.classList.add('unlocked');
        document.getElementById('tab-espectroscopia').click();
    });

    // ----------------------------------------------------
    // 8. SPECTROSCOPY (STEP 4)
    // ----------------------------------------------------
    btnSpecBlanco.addEventListener('click', () => {
        btnSpecBlanco.disabled = true;
        specStatusDot.className = "pulse-dot yellow";
        specStatusText.innerText = "Calibrando blanco...";
        specConsole.innerText = `[ESPECTRÓMETRO]: Insertando cubeta de cuarzo vacía con solvente ${SOLVENT_EFFICACY[state.selectedSolvente].name}...`;

        // Turn laser beam on
        laserBeamIndicator.className = "laser-beam active-blue";
        laserBeamAttenuated.className = "laser-beam attenuated active-blue";

        setTimeout(() => {
            state.specBlankCalibrated = true;
            
            specStatusDot.className = "pulse-dot green";
            specStatusText.innerText = "Blanco Calibrado (0.0 Abs)";
            specConsole.innerText = `[ESPECTRÓMETRO]: Calibración a 0.000 Absorbancia (100% Transmitancia) finalizada. Retira la celda blanco e inserta tu muestra.`;

            // Reset lasers
            laserBeamIndicator.className = "laser-beam";
            laserBeamAttenuated.className = "laser-beam attenuated";

            btnSpecMuestra.disabled = false;
        }, 2000);
    });

    btnSpecMuestra.addEventListener('click', () => {
        btnSpecMuestra.disabled = true;
        specStatusDot.className = "pulse-dot yellow";
        specStatusText.innerText = "Cargando muestra fúngica...";

        // Fill Cuvette liquid with active strain extraction color
        const pigmentHex = state.selectedTlcBand ? SPECIES_DATA[state.selectedTlcBand].colorHex : "#cbd5e1";
        cuvetteLiquid.style.background = hexToRGBA(pigmentHex, 0.45);
        cuvetteInner.style.transform = "translateY(0)"; // drop cuvette into slot

        setTimeout(() => {
            state.specCuvetteLoaded = true;
            
            specStatusDot.className = "pulse-dot green";
            specStatusText.innerText = "Cubeta Cargada";
            specConsole.innerText = `[ESPECTRÓMETRO]: Cubeta de cuarzo insertada en la celda de lectura óptica de transmitancia. Listo para escanear rango visible.`;
            
            btnSpecScan.disabled = false;
        }, 1500);
    });

    btnSpecScan.addEventListener('click', () => {
        btnSpecScan.disabled = true;
        specStatusDot.className = "pulse-dot yellow";
        specStatusText.innerText = "Escaneando longitud de onda...";
        specConsole.innerText = `[ESPECTRÓMETRO]: Activando lámpara de deuterio-tungsteno. Escaneando red de difracción visible de 300 a 700 nm...`;

        // Pulse and turn on lasers depending on pigment color
        const pigmentColor = state.selectedTlcBand ? state.selectedTlcBand : 'chrysogenum';
        let beamClass = 'active-green'; // for red purpurogenum (absorbs green)
        if (pigmentColor === 'chrysogenum') beamClass = 'active-blue'; // absorbs blue
        else if (pigmentColor === 'strain_orange') beamClass = 'active-cyan'; // absorbs blue-green

        laserBeamIndicator.className = `laser-beam ${beamClass}`;
        
        // Attenuated beam is much thinner/dimmer because of absorbance
        laserBeamAttenuated.className = `laser-beam attenuated ${beamClass} absorbed`;

        // Triggers Spectroscopy chart solver animation
        drawSpectroscopyChart();

        setTimeout(() => {
            state.specScanPerformed = true;
            
            // Show stats bar
            specResultsBox.style.display = "flex";
            const activeData = SPECIES_DATA[pigmentColor];
            
            specResWavelength.innerText = `${activeData.peakWavelength} nm`;
            
            // Absorbance value calibrated to the extraction yield
            const calcAbs = parseFloat(((state.rendimientoExtraccion / 100) * 1.45).toFixed(3));
            specResAbsorbance.innerText = `${calcAbs.toFixed(3)} Abs`;
            specResFamily.innerText = activeData.family;

            specStatusDot.className = "pulse-dot green";
            specStatusText.innerText = "Escaneo Finalizado";
            
            specConsole.innerText = `[ESPECTRÓMETRO]: Escaneo completado. Pico óptico detectado a longitud de onda máxima (λmax) = ${activeData.peakWavelength} nm. `;
            specConsole.innerText += `La absorbancia de ${calcAbs.toFixed(3)} Abs valida un perfil molecular compatible con la familia de las ${activeData.family}.`;

            // Reset lasers
            laserBeamIndicator.className = "laser-beam";
            laserBeamAttenuated.className = "laser-beam attenuated";

            btnProcederMicroscopio.disabled = false;
        }, 3500);
    });

    btnProcederMicroscopio.addEventListener('click', () => {
        tabMicroscopia.classList.add('unlocked');
        document.getElementById('tab-microscopia').click();
    });

    // Chart Spectrophotometer plotting engine (Native 2D Canvas)
    const drawSpectroscopyChart = () => {
        const canvas = document.getElementById('canvas-espectro');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0,0,w,h);

        const padLeft = 32;
        const padRight = 12;
        const padTop = 15;
        const padBottom = 22;

        const cw = w - padLeft - padRight;
        const ch = h - padTop - padBottom;

        // Background grid and labels
        ctx.fillStyle = "#0c111d";
        ctx.fillRect(padLeft, padTop, cw, ch);
        
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        
        for (let wl = 300; wl <= 700; wl += 50) {
            const x = padLeft + ((wl - 300) / 400) * cw;
            ctx.beginPath();
            ctx.moveTo(x, padTop);
            ctx.lineTo(x, padTop + ch);
            ctx.stroke();

            ctx.fillStyle = "#64748b";
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.textAlign = "center";
            ctx.fillText(`${wl}nm`, x, padTop + ch + 12);
        }

        const absTicks = [0, 0.5, 1.0, 1.5];
        absTicks.forEach(val => {
            const y = padTop + ch - (val / 1.5) * ch;
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + cw, y);
            ctx.stroke();

            ctx.fillStyle = "#64748b";
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.textAlign = "right";
            ctx.fillText(`${val.toFixed(1)}`, padLeft - 6, y + 3);
        });

        // Compute spectroscopy absorption curves using normal/gaussian dispersion curves
        const pigmentColor = state.selectedTlcBand ? state.selectedTlcBand : 'chrysogenum';
        const activeData = SPECIES_DATA[pigmentColor];
        const peak = activeData.peakWavelength;
        const secPeak = activeData.secondaryPeak;
        const calcAbs = (state.rendimientoExtraccion / 100) * 1.35;

        const getAbsorbance = (wl) => {
            // Main Gaussian peak
            const mainDist = Math.pow(wl - peak, 2);
            const mainGauss = calcAbs * Math.exp(-mainDist / 2000); 

            // Secondary UV peak
            const secDist = Math.pow(wl - secPeak, 2);
            const secGauss = 0.55 * Math.exp(-secDist / 1200);

            // Baseline noise
            const noise = 0.02 * Math.sin(wl / 10.0) + (Math.random() * 0.005);

            return Math.max(mainGauss + secGauss + noise, 0.01);
        };

        const points = [];
        for (let wl = 300; wl <= 700; wl += 2) {
            const x = padLeft + ((wl - 300) / 400) * cw;
            const abs = getAbsorbance(wl);
            const y = padTop + ch - (abs / 1.5) * ch;
            points.push({ x, y, wl, abs });
        }

        // Animate UV-Vis Scan line
        let limit = 0;
        const animInterval = setInterval(() => {
            if (limit < points.length) {
                ctx.clearRect(padLeft, padTop, cw, ch);

                // Redraw grid
                ctx.fillStyle = "#0c111d";
                ctx.fillRect(padLeft, padTop, cw, ch);
                ctx.strokeStyle = "rgba(255,255,255,0.03)";
                for (let wl = 300; wl <= 700; wl += 50) {
                    const x = padLeft + ((wl - 300) / 400) * cw;
                    ctx.beginPath();
                    ctx.moveTo(x, padTop);
                    ctx.lineTo(x, padTop + ch);
                    ctx.stroke();
                }
                absTicks.forEach(val => {
                    const y = padTop + ch - (val / 1.5) * ch;
                    ctx.beginPath();
                    ctx.moveTo(padLeft, y);
                    ctx.lineTo(padLeft + cw, y);
                    ctx.stroke();
                });

                const slice = points.slice(0, limit + 1);

                // Draw gradient under curve
                const fillGrad = ctx.createLinearGradient(padLeft, padTop, padLeft, padTop + ch);
                fillGrad.addColorStop(0, hexToRGBA(activeData.colorHex, 0.15));
                fillGrad.addColorStop(1, "rgba(12, 17, 29, 0.0)");
                ctx.fillStyle = fillGrad;
                ctx.beginPath();
                ctx.moveTo(slice[0].x, padTop + ch);
                for (let i = 0; i < slice.length; i++) {
                    ctx.lineTo(slice[i].x, slice[i].y);
                }
                ctx.lineTo(slice[slice.length - 1].x, padTop + ch);
                ctx.closePath();
                ctx.fill();

                // Draw curve
                ctx.strokeStyle = activeData.colorHex;
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.moveTo(slice[0].x, slice[0].y);
                for (let i = 1; i < slice.length; i++) {
                    ctx.lineTo(slice[i].x, slice[i].y);
                }
                ctx.stroke();

                limit += 2;
            } else {
                clearInterval(animInterval);
                
                // Draw peak arrow label
                const peakPt = points.find(pt => pt.wl === peak);
                if (peakPt) {
                    ctx.strokeStyle = "rgba(255,255,255,0.45)";
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.moveTo(peakPt.x, peakPt.y);
                    ctx.lineTo(peakPt.x, padTop + ch);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "8px 'Outfit', sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText(`λmax = ${peak}nm`, peakPt.x, peakPt.y - 8);
                }
            }
        }, 12);
    };

    // ----------------------------------------------------
    // 9. VIRTUAL MICROSCOPE (STEP 5)
    // ----------------------------------------------------
    zoomButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            zoomButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.microZoom = parseInt(btn.getAttribute('data-zoom'));
            
            microGuideText.innerText = getMicroscopeGuide(state.selectedMicroSample, state.microZoom);
            triggerMicroscopeFocusAlert();
        });
    });

    microSampleSelect.addEventListener('change', (e) => {
        state.selectedMicroSample = e.target.value;
        
        microGuideText.innerText = getMicroscopeGuide(state.selectedMicroSample, state.microZoom);
        triggerMicroscopeFocusAlert();
    });

    focusSlider.addEventListener('input', (e) => {
        state.microFocus = parseInt(e.target.value);
        focusVal.innerText = state.microFocus;
        triggerMicroscopeFocusAlert();
    });

    const triggerMicroscopeFocusAlert = () => {
        if (state.microFocus >= 45 && state.microFocus <= 55) {
            focusAlert.className = "alert-box success-alert";
            focusAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Enfoque resuelto. Se aprecian las estructuras fúngicas en alta nitidez.`;
            btnProcederBitacora.disabled = false;
        } else {
            focusAlert.className = "alert-box warning-alert";
            focusAlert.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Portaobjetos fuera de plano. Mueve el micrómetro para enfocar (Óptimo cerca de 50).`;
        }
    };

    const getMicroscopeGuide = (sample, zoom) => {
        const guides = {
            penicillium_active: {
                100: "Enfoque 100x: Se distingue la densa red de hilos entrelazados de hifas hialinas tabicadas (micelio vegetativo fúngico). La hifa septada es delgada y regular.",
                400: "Enfoque 400x: Estructuras conidiógenas. Conidióforos ramificados característicos en forma de cepillo o escoba, con métulas, fiálides y cadenas de conidios globosos.",
                1000: "Enfoque 1000x (Inmersión): Se aprecia el septado en la fiálide y la superficie lisa de las esporas asexuales (conidios) que contienen los pigmentos."
            },
            contam_aspergillus: {
                100: "Enfoque 100x: Cabezas conidiales densas y globosas de color oscuro. Crecimiento radial invasivo que estrangula las hifas de Penicillium.",
                400: "Enfoque 400x: Conidióforo no ramificado que termina en una gran vesícula esférica. Fiálides biseriadas que cubren toda la superficie de la vesícula.",
                1000: "Enfoque 1000x: Estructura de vesícula y fiálides en collarín de Aspergillus, característico de contaminación por falta de asepsia celular."
            },
            contam_rhizopus: {
                100: "Enfoque 100x: Hifas muy gruesas y cenocíticas (no septadas). Presencia de estructuras tipo raíz (rizoides) y esporangios gigantescos globulares.",
                400: "Enfoque 400x: Esporangióforo largo y erecto que sostiene un esporangio esférico con columela central y miles de esporangiosporas oscuras en su interior.",
                1000: "Enfoque 1000x: Esporangiosporas estriadas de Rhizopus sp. liberadas de la columela fúngica residual."
            },
            contam_bacterias: {
                100: "Enfoque 100x: Se aprecian pequeños cúmulos puntiformes translúcidos que enturbian el fondo del cultivo líquido, alcalinizando el medio.",
                400: "Enfoque 400x: Nula presencia de hifas. El campo está invadido por microestructuras bacterianas móviles.",
                1000: "Enfoque 1000x: Cocos agrupados en racimos (Staphylococcus) y bacilos en cadena que compiten metabólicamente, destruyendo los pigmentos fúngicos."
            }
        };
        return guides[sample][zoom];
    };

    // Microscope ocular rendering loop
    const startMicroscopeLoop = () => {
        stopMicroscopeLoop();
        
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.className = "ocular-view-canvas";
        ocularViewElement.innerHTML = '';
        ocularViewElement.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        let angle = 0;
        const render = () => {
            drawMicrospecimen(ctx, state.selectedMicroSample, state.microZoom, state.microFocus, angle);
            angle += 0.004;
            state.microLoopId = requestAnimationFrame(render);
        };
        render();
    };

    const stopMicroscopeLoop = () => {
        if (state.microLoopId) {
            cancelAnimationFrame(state.microLoopId);
            state.microLoopId = null;
        }
    };

    const drawMicrospecimen = (ctx, sample, zoom, focus, angle) => {
        const w = 400;
        const h = 400;
        ctx.clearRect(0,0,w,h);

        // Compute optical lens blurring coefficient
        const blurAmt = Math.min(Math.abs(focus - 50) / 2.5, 12);
        
        // Base dark microscope lighting
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0,0,w,h);

        ctx.save();
        
        // Apply focus blur filter to canvas rendering
        if (blurAmt > 0.1) {
            ctx.filter = `blur(${blurAmt}px)`;
        }

        // Draw slide field of view light
        const lightGrad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, 195);
        lightGrad.addColorStop(0, "#e0f2fe");
        lightGrad.addColorStop(0.65, "#bae6fd");
        lightGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 190, 0, Math.PI * 2);
        ctx.fill();

        // Translate to center for rotation simulation
        ctx.translate(w/2, h/2);
        ctx.rotate(angle);

        // Render structures depending on magnification and strain
        ctx.strokeStyle = "rgba(14, 165, 233, 0.4)";
        ctx.lineWidth = 2.0;

        if (sample === 'penicillium_active') {
            const strainColor = SPECIES_DATA[state.selectedCepa].colorHex;
            ctx.strokeStyle = "rgba(13, 148, 136, 0.45)"; // teal-green hifas

            if (zoom === 100) {
                // Network of septated hyphae
                ctx.lineWidth = 1.5;
                for (let i = -150; i < 150; i += 30) {
                    ctx.beginPath();
                    ctx.moveTo(i, -170);
                    ctx.bezierCurveTo(i + 30, -50, i - 30, 50, i + 10, 170);
                    ctx.stroke();

                    // Septations
                    ctx.fillStyle = "rgba(255,255,255,0.4)";
                    for (let y = -140; y < 140; y += 40) {
                        ctx.beginPath();
                        ctx.arc(i + 3, y, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else if (zoom === 400) {
                // Brush Conidiophores
                drawBrushConidiophore(ctx, -60, -30, 0.8, strainColor);
                drawBrushConidiophore(ctx, 40, 60, 0.9, strainColor);
                drawBrushConidiophore(ctx, -10, 110, 0.6, strainColor);
            } else if (zoom === 1000) {
                // Single huge brush zoom with spores septations details
                drawBrushConidiophore(ctx, 0, 50, 2.2, strainColor);
            }
        } else if (sample === 'contam_aspergillus') {
            ctx.strokeStyle = "rgba(101, 163, 13, 0.45)"; // greenish Aspergillus

            if (zoom === 100) {
                // Dense round heads
                for (let i = 0; i < 6; i++) {
                    const x = Math.sin(i * 1.0) * 110;
                    const y = Math.cos(i * 1.0) * 110;
                    ctx.fillStyle = "rgba(101, 163, 13, 0.2)";
                    ctx.beginPath();
                    ctx.arc(x, y, 22, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            } else if (zoom === 400 || zoom === 1000) {
                const scale = zoom === 400 ? 1.0 : 2.4;
                ctx.translate(0, 30);
                
                // Conidiophore stem
                ctx.lineWidth = 5 * scale;
                ctx.beginPath();
                ctx.moveTo(0, 180);
                ctx.lineTo(0, -20);
                ctx.stroke();

                // Giant vesicle
                ctx.fillStyle = "rgba(77, 124, 15, 0.85)";
                ctx.beginPath();
                ctx.arc(0, -20, 28 * scale, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // Biseriate phialides and spores radial array
                ctx.strokeStyle = "rgba(132, 204, 22, 0.6)";
                ctx.lineWidth = 2 * scale;
                for (let a = 0; a < Math.PI * 2; a += 0.18) {
                    const vx = Math.cos(a) * (28 * scale);
                    const vy = Math.sin(a) * (28 * scale);
                    const ex = Math.cos(a) * (52 * scale);
                    const ey = Math.sin(a) * (52 * scale);
                    
                    ctx.beginPath();
                    ctx.moveTo(vx, -20 + vy);
                    ctx.lineTo(ex, -20 + ey);
                    ctx.stroke();

                    // Chains of spores
                    ctx.fillStyle = "rgba(217, 249, 157, 0.8)";
                    ctx.beginPath();
                    ctx.arc(ex, -20 + ey, 3.5 * scale, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        } else if (sample === 'contam_rhizopus') {
            ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
            
            if (zoom === 100) {
                // Densely packed thick cenocytic hyphae
                ctx.lineWidth = 3.5;
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.moveTo(-180, -100 + i * 50);
                    ctx.lineTo(180, 100 - i * 30);
                    ctx.stroke();
                }
                
                // Giant globose sporangia
                ctx.fillStyle = "rgba(30, 41, 59, 0.75)";
                ctx.beginPath();
                ctx.arc(-30, -40, 32, 0, Math.PI * 2);
                ctx.arc(80, 60, 28, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else if (zoom === 400 || zoom === 1000) {
                const scale = zoom === 400 ? 1.0 : 2.5;
                ctx.translate(0, 40);
                
                // Sporangiophore
                ctx.lineWidth = 6 * scale;
                ctx.beginPath();
                ctx.moveTo(0, 180);
                ctx.lineTo(0, -30);
                ctx.stroke();

                // Sporangium wall (transluncid)
                ctx.fillStyle = "rgba(100, 116, 139, 0.25)";
                ctx.beginPath();
                ctx.arc(0, -30, 42 * scale, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // Columella inside
                ctx.fillStyle = "rgba(51, 65, 85, 0.9)";
                ctx.beginPath();
                ctx.arc(0, -30, 22 * scale, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // Thousands of micro spores
                ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
                for (let s = 0; s < 45; s++) {
                    const ra = Math.random() * Math.PI * 2;
                    const rd = (24 + Math.random() * 16) * scale;
                    ctx.beginPath();
                    ctx.arc(Math.cos(ra) * rd, -30 + Math.sin(ra) * rd, 2.5 * scale, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        } else if (sample === 'contam_bacterias') {
            // Background is blurry cocci/bacilli noise
            ctx.fillStyle = "rgba(224, 242, 254, 0.3)";
            
            const count = zoom === 100 ? 60 : (zoom === 400 ? 150 : 350);
            const size = zoom === 100 ? 2 : (zoom === 400 ? 4 : 8);

            for (let b = 0; b < count; b++) {
                const bx = -160 + (b * 17) % 320;
                const by = -160 + (b * 29) % 320;
                
                ctx.fillStyle = b % 2 === 0 ? "rgba(225, 29, 72, 0.45)" : "rgba(37, 99, 235, 0.45)";
                
                if (b % 3 === 0) {
                    // Bacilli (rod)
                    ctx.save();
                    ctx.translate(bx, by);
                    ctx.rotate(bx * 0.1);
                    ctx.fillRect(-size, -size/2.5, size*2, size/1.2);
                    ctx.restore();
                } else {
                    // Cocci (round sphere)
                    ctx.beginPath();
                    ctx.arc(bx, by, size/1.2, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        }

        ctx.restore();
    };

    const drawBrushConidiophore = (ctx, cx, cy, scale, color) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // 1. Conidiophore main stalk
        ctx.strokeStyle = "rgba(13, 148, 136, 0.8)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 120);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // Septums on stalk
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(0, 80, 1.5, 0, Math.PI * 2);
        ctx.arc(0, 40, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 2. Metulae (branches)
        ctx.strokeStyle = "rgba(20, 184, 166, 0.85)";
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-12, -22);
        ctx.moveTo(0, 0); ctx.lineTo(0, -28);
        ctx.moveTo(0, 0); ctx.lineTo(12, -22);
        ctx.stroke();

        // 3. Phialides (flasks holding spores)
        ctx.strokeStyle = "rgba(45, 212, 191, 0.9)";
        ctx.lineWidth = 2;
        
        // Left branch phialides
        ctx.beginPath();
        ctx.moveTo(-12, -22); ctx.lineTo(-22, -42);
        ctx.moveTo(-12, -22); ctx.lineTo(-10, -45);
        // Center branch phialides
        ctx.moveTo(0, -28); ctx.lineTo(-4, -50);
        ctx.moveTo(0, -28); ctx.lineTo(4, -50);
        // Right branch phialides
        ctx.moveTo(12, -22); ctx.lineTo(10, -45);
        ctx.moveTo(12, -22); ctx.lineTo(22, -42);
        ctx.stroke();

        // 4. Chains of globose spores (conidios)
        ctx.fillStyle = color;
        const phialidesEnds = [
            { x: -22, y: -42 }, { x: -10, y: -45 },
            { x: -4, y: -50 }, { x: 4, y: -50 },
            { x: 10, y: -45 }, { x: 22, y: -42 }
        ];

        phialidesEnds.forEach(p => {
            // Draw a chain of 4-5 tiny spores rising from each phialide
            let sx = p.x;
            let sy = p.y;
            for (let s = 0; s < 5; s++) {
                sy -= 7;
                sx += (Math.sin(s * 1.5) * 1.2);
                ctx.beginPath();
                ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.restore();
    };

    // User microscope uploader trigger
    microUploadZone.addEventListener('click', () => microUploadInput.click());
    
    microUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Change Ocular element to display user uploaded file in slot!
                stopMicroscopeLoop();
                ocularViewElement.innerHTML = `<div class="user-lens-photo" style="background: url('${event.target.result}') center/cover no-repeat; width: 100%; height: 100%; filter: blur(${Math.min(Math.abs(state.focusSlider - 50)/2.5, 8)}px)"></div>`;
                
                // Track update on slider change
                focusSlider.oninput = (slVal) => {
                    const focusVal = parseInt(slVal.target.value);
                    const b = Math.min(Math.abs(focusVal - 50)/2.5, 8);
                    const photoDiv = ocularViewElement.querySelector('.user-lens-photo');
                    if (photoDiv) {
                        photoDiv.style.filter = `blur(${b}px)`;
                    }
                    state.microFocus = focusVal;
                    document.getElementById('focus-val').innerText = focusVal;
                    triggerMicroscopeFocusAlert();
                };
                
                triggerMicroscopeFocusAlert();
                
                // Auto register evidence into general gallery
                const polaroidTitle = `Foto Real: ${microSampleSelect.options[microSampleSelect.selectedIndex].text}`;
                const polaroidDesc = `Evidencia física agregada por el estudiante usando la carga del microscopio real. Enfoque: ${state.microZoom}x.`;
                addNewPolaroidToGallery(event.target.result, polaroidTitle, polaroidDesc, 'Evidencia Ocular');
            };
            reader.readAsDataURL(file);
        }
    });

    btnProcederBitacora.addEventListener('click', () => {
        const targetId = 'panel-bitacora';
        stepTabs.forEach(t => t.classList.remove('active'));
        panelSections.forEach(panel => panel.classList.remove('active'));
        
        const tab = document.querySelector(`.step-tab[data-target="${targetId}"]`);
        if (tab) tab.classList.add('active');
        
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.add('active');
            initGalleryCanvases();
            renderQuestionnaire();
        }
    });

    // ----------------------------------------------------
    // 10. SIMULATOR LOGS DATABASE (STEP 6.1)
    // ----------------------------------------------------
    // Adds a run row to the Bitácora database table
    const registerRunLog = () => {
        if (state.crecimientoMicelial === 0) return;
        
        const now = new Date();
        const timestamp = `${now.getDate()}/${now.getMonth()+1} ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        const cepaName = SPECIES_DATA[state.selectedCepa].pigmentName;
        
        let mediumInfo = MEDIA_PROFILES[state.agarMedio].name;
        if (state.turbidezRealizada) {
            mediumInfo += ` (Turbidez: ${state.turbidezMedida.toFixed(3)} OD)`;
        }

        const solvent = SOLVENT_EFFICACY[state.selectedSolvente].name;
        const chromatographyRf = state.selectedTlcBand ? `${SPECIES_DATA[state.selectedTlcBand].pigmentName} (Rf: ${activeTlcRf().toFixed(2)})` : "No purificado";
        const maxWavelength = state.specScanPerformed ? `${SPECIES_DATA[state.selectedCepa].peakWavelength} nm` : "No escaneado";

        const logEntry = {
            id: Date.now(),
            time: timestamp,
            cepa: cepaName,
            medio: mediumInfo,
            solvente: solvent,
            rf: chromatographyRf,
            wl: maxWavelength
        };

        state.cuadernoEnsayos.push(logEntry);
        renderTableLogs();
    };

    const activeTlcRf = () => {
        return SPECIES_DATA[state.selectedCepa].rf[state.faseMovilTLC];
    };

    const renderTableLogs = () => {
        tableLogsBody.innerHTML = '';
        if (state.cuadernoEnsayos.length === 0) {
            tableLogsBody.innerHTML = `
                <tr class="empty-row-placeholder">
                    <td colspan="7"><i class="fa-solid fa-folder-open"></i> Aún no has registrado ensayos. Completa una simulación y haz clic en "Registrar Resultados".</td>
                </tr>`;
            return;
        }

        state.cuadernoEnsayos.forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${log.time}</td>
                <td>${log.cepa}</td>
                <td style="font-size:11.5px;">${log.medio}</td>
                <td>${log.solvente}</td>
                <td>${log.rf}</td>
                <td class="font-mono text-pink font-bold">${log.wl}</td>
                <td>
                    <button class="btn-danger-outline small-btn btn-del-log" data-id="${log.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            
            // Delete action
            tr.querySelector('.btn-del-log').addEventListener('click', () => {
                state.cuadernoEnsayos = state.cuadernoEnsayos.filter(item => item.id !== log.id);
                renderTableLogs();
            });

            tableLogsBody.appendChild(tr);
        });
    };

    btnBorrarBitacora.addEventListener('click', () => {
        if (confirm("¿Estás seguro de que deseas limpiar todo el historial de corridas del laboratorio virtual?")) {
            state.cuadernoEnsayos = [];
            renderTableLogs();
        }
    });

    // Auto-register logs upon finishing Steps 4/5
    btnProcederMicroscopio.addEventListener('click', registerRunLog);
    btnProcederBitacora.addEventListener('click', registerRunLog);

    // ----------------------------------------------------
    // 11. LABORATORY EXPERIMENTAL EVIDENCE GALLERY (POLAROIDS)
    // ----------------------------------------------------
    // Draw pre-loaded mock canvas elements on the fly to avoid broken external links
    const initGalleryCanvases = () => {
        const c1 = document.getElementById('pre-img-culture');
        if (c1) drawCulturePlaceholder(c1);

        const c2 = document.getElementById('pre-img-microscope');
        if (c2) drawMicroscopePlaceholder(c2);

        const c3 = document.getElementById('pre-img-tlc-scan');
        if (c3) drawTlcPlaceholder(c3);

        const c4 = document.getElementById('canvas-contam-aspergillus-pre');
        if (c4) drawAspergillusContamPlaceholder(c4);

        const c5 = document.getElementById('canvas-contam-rhizopus-pre');
        if (c5) drawRhizopusContamPlaceholder(c5);

        const c6 = document.getElementById('canvas-contam-bact-pre');
        if (c6) drawBacteriaContamPlaceholder(c6);
    };

    const drawCulturePlaceholder = (canvas) => {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = "#ca8a04"; // YES Agar background
        ctx.fillRect(0,0,w,h);

        // Dish rim
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 90, 0, Math.PI * 2);
        ctx.stroke();

        // Giant mold colony
        const moldGrad = ctx.createRadialGradient(w/2, h/2, 5, w/2, h/2, 60);
        moldGrad.addColorStop(0, "#f8fafc");
        moldGrad.addColorStop(0.3, "#a1a1aa");
        moldGrad.addColorStop(0.8, "#115e59"); // Blue-green mycelium
        moldGrad.addColorStop(1, "rgba(234, 179, 8, 0.0)");
        
        ctx.fillStyle = moldGrad;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 80, 0, Math.PI*2);
        ctx.fill();

        // Glowing yellow exudate drops
        ctx.fillStyle = "rgba(251, 191, 36, 0.85)";
        for (let i = 0; i < 8; i++) {
            const rx = w/2 - 25 + Math.random() * 50;
            const ry = h/2 - 25 + Math.random() * 50;
            ctx.beginPath();
            ctx.arc(rx, ry, 3.5, 0, Math.PI*2);
            ctx.fill();
        }
    };

    const drawMicroscopePlaceholder = (canvas) => {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0,0,w,h);

        // Ocular light
        const rGrad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 100);
        rGrad.addColorStop(0, "#bae6fd");
        rGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 98, 0, Math.PI * 2);
        ctx.fill();

        // Draw conidiophore brush
        drawBrushConidiophore(ctx, w/2, h/2 + 20, 1.1, "#ef4444");
    };

    const drawTlcPlaceholder = (canvas) => {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(0,0,w,h);

        // Plaque background grid
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w/2 - 40, 20); ctx.lineTo(w/2 - 40, h - 20);
        ctx.moveTo(w/2 + 40, 20); ctx.lineTo(w/2 + 40, h - 20);
        ctx.moveTo(w/2 - 60, h - 40); ctx.lineTo(w/2 + 60, h - 40); // origin
        ctx.moveTo(w/2 - 60, 40); ctx.lineTo(w/2 + 60, 40); // front
        ctx.stroke();

        // Spotted bands
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)"; // purpurogenum band
        ctx.beginPath(); ctx.arc(w/2 - 40, h - 90, 6, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = "rgba(251, 191, 36, 0.9)"; // chrysogenum band
        ctx.beginPath(); ctx.arc(w/2 + 40, h - 120, 6, 0, Math.PI*2); ctx.fill();
    };

    const drawAspergillusContamPlaceholder = (canvas) => {
        const ctx = canvas.getContext('2d');
        drawOcularCircleMock(ctx, canvas.width, canvas.height);
        drawBacteriaBackgroundNoise(ctx, canvas.width, canvas.height, 12, "rgba(101, 163, 13, 0.3)");
        ctx.translate(canvas.width/2, canvas.height/2 + 10);
        
        ctx.strokeStyle = "rgba(101, 163, 13, 0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(0, -10); ctx.stroke();
        
        ctx.fillStyle = "rgba(77, 124, 15, 0.9)";
        ctx.beginPath(); ctx.arc(0, -10, 16, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    };

    const drawRhizopusContamPlaceholder = (canvas) => {
        const ctx = canvas.getContext('2d');
        drawOcularCircleMock(ctx, canvas.width, canvas.height);
        
        ctx.strokeStyle = "rgba(71, 85, 105, 0.6)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(canvas.width/2, canvas.height); ctx.lineTo(canvas.width/2, canvas.height/2 - 10); ctx.stroke();

        ctx.fillStyle = "rgba(100, 116, 139, 0.35)";
        ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2 - 10, 24, 0, Math.PI*2); ctx.fill(); ctx.stroke();

        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2 - 10, 12, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    };

    const drawBacteriaContamPlaceholder = (canvas) => {
        const ctx = canvas.getContext('2d');
        drawOcularCircleMock(ctx, canvas.width, canvas.height);
        drawBacteriaBackgroundNoise(ctx, canvas.width, canvas.height, 45, "rgba(225, 29, 72, 0.5)");
        drawBacteriaBackgroundNoise(ctx, canvas.width, canvas.height, 45, "rgba(37, 99, 235, 0.5)");
    };

    const drawOcularCircleMock = (ctx, w, h) => {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0,0,w,h);

        const rGrad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 60);
        rGrad.addColorStop(0, "#e0f2fe");
        rGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = rGrad;
        ctx.beginPath(); ctx.arc(w/2, h/2, 58, 0, Math.PI * 2); ctx.fill();
    };

    const drawBacteriaBackgroundNoise = (ctx, w, h, count, color) => {
        ctx.fillStyle = color;
        for (let b = 0; b < count; b++) {
            const bx = w/2 - 45 + Math.random() * 90;
            const by = h/2 - 45 + Math.random() * 90;
            ctx.beginPath();
            ctx.arc(bx, by, 1.5, 0, Math.PI*2);
            ctx.fill();
        }
    };

    // User files dropping handler
    uploadZone.addEventListener('click', () => imageUploadInput.click());
    
    imageUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                addNewPolaroidToGallery(event.target.result, "Ensayo del Estudiante", "Evidencia física cargada por el estudiante del cultivo fúngico real del proyecto de aula.", "Foto de Aula");
            };
            reader.readAsDataURL(file);
        }
    });

    const addNewPolaroidToGallery = (imageSrc, title, desc, tag) => {
        const now = new Date();
        const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
        
        const card = document.createElement('div');
        card.className = "polaroid-card animate-scale-up";
        card.innerHTML = `
            <div class="polaroid-img-wrapper">
                <img src="${imageSrc}" alt="User Polaroid Evidence" class="polaroid-canvas" />
                <span class="img-badge font-mono">${tag.toUpperCase()}</span>
            </div>
            <div class="polaroid-caption">
                <h4 class="editable-title" contenteditable="true">${title}</h4>
                <p class="editable-desc" contenteditable="true">${desc}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="polaroid-date font-mono">${dateStr}</span>
                    <button class="btn-danger-outline small-btn btn-del-polaroid" style="padding: 2px 6px; font-size:10px;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        
        // Delete action
        card.querySelector('.btn-del-polaroid').addEventListener('click', () => {
            if (confirm("¿Estás seguro de que deseas eliminar esta foto de evidencia?")) {
                card.remove();
            }
        });

        // Insert at beginning of grid after the pre-loaded elements
        galleryGrid.insertBefore(card, galleryGrid.firstChild);
    };

    // Contaminations uploader trigger
    contamUploadZone.addEventListener('click', () => contamUploadInput.click());
    
    contamUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                addNewContaminationPolaroid(event.target.result, "Caso de Contaminación Registrado", "Carga física del cultivo competidor bacteriano o fúngico invadiendo la biomasa.");
            };
            reader.readAsDataURL(file);
        }
    });

    const addNewContaminationPolaroid = (imageSrc, title, desc) => {
        const now = new Date();
        const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;

        const card = document.createElement('div');
        card.className = "polaroid-card animate-scale-up";
        card.innerHTML = `
            <div class="polaroid-img-wrapper">
                <img src="${imageSrc}" alt="Contamination user evidence" class="polaroid-canvas" />
                <span class="img-badge font-mono" style="background:#ef4444;">CONTAMINACIÓN</span>
            </div>
            <div class="polaroid-caption">
                <h4 class="editable-title" contenteditable="true">${title}</h4>
                <p class="editable-desc" contenteditable="true">${desc}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="polaroid-date font-mono">${dateStr}</span>
                    <button class="btn-danger-outline small-btn btn-del-polaroid" style="padding: 2px 6px; font-size:10px;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;

        card.querySelector('.btn-del-polaroid').addEventListener('click', () => {
            if (confirm("¿Estás seguro de que deseas eliminar esta evidencia de contaminación?")) {
                card.remove();
            }
        });

        contamGalleryGrid.insertBefore(card, contamGalleryGrid.firstChild);
    };

    // ----------------------------------------------------
    // 12. GESTIÓN DEL CUESTIONARIO ACADÉMICO PERSISTENTE (CRUD)
    // ----------------------------------------------------
    // Al cargar la página, cargamos los datos guardados en LocalStorage
    const loadQuestionnaireData = () => {
        const stored = localStorage.getItem('penicillium_answers_v2');
        if (stored) {
            try {
                state.cuestionarioRespuestas = JSON.parse(stored);
            } catch (e) {
                console.error("Error al parsear respuestas del cuestionario:", e);
            }
        }
    };

    // Renderiza dinámicamente las respuestas guardadas, imágenes y configura los botones
    const renderQuestionnaire = () => {
        loadQuestionnaireData();
        
        for (let q = 1; q <= 5; q++) {
            const savedAnsBox = document.getElementById(`saved-ans-${q}`);
            const attachedImgBox = document.getElementById(`attached-img-${q}`);
            const editForm = document.getElementById(`edit-form-${q}`);
            const inputField = document.getElementById(`q-input-${q}`);
            const fileStatus = document.getElementById(`q-file-status-${q}`);
            
            const btnSave = document.querySelector(`.btn-save-answer[data-q="${q}"]`);
            const btnEdit = document.querySelector(`.btn-edit-answer[data-q="${q}"]`);
            const btnDelete = document.querySelector(`.btn-delete-answer[data-q="${q}"]`);
            
            const item = state.cuestionarioRespuestas[q];
            
            // 1. Mostrar respuesta de texto
            if (item && item.texto.trim() !== '') {
                savedAnsBox.innerHTML = `<p>${escapeHTML(item.texto)}</p>`;
                inputField.value = item.texto;
            } else {
                savedAnsBox.innerHTML = `<p class="answer-placeholder"><em>Aún no has guardado una respuesta para esta pregunta. Haz clic en "Editar Respuesta" abajo para redactar.</em></p>`;
                inputField.value = '';
            }
            
            // 2. Mostrar imagen adjunta
            if (item && item.imagen && item.imagen !== '') {
                attachedImgBox.innerHTML = `<img src="${item.imagen}" alt="Evidencia de Laboratorio P${q}" />`;
                attachedImgBox.style.display = 'block';
                fileStatus.innerText = "✓ Imagen adjunta correctamente";
                fileStatus.style.color = "var(--neon-emerald)";
            } else {
                attachedImgBox.innerHTML = '';
                attachedImgBox.style.display = 'none';
                fileStatus.innerText = "Sin imagen cargada";
                fileStatus.style.color = "#64748b";
            }
        }
    };

    // Registrar manejadores de eventos CRUD para los cuestionarios
    const initQuestionnaireEvents = () => {
        // Disparar diálogos de selección de archivos ocultos
        const triggerBtns = document.querySelectorAll('.btn-trigger-file');
        triggerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetInputId = btn.getAttribute('data-target-input');
                const fileInput = document.getElementById(targetInputId);
                if (fileInput) fileInput.click();
            });
        });

        // Manejar subida de archivos y conversión a Base64
        const fileUploaders = document.querySelectorAll('.q-file-uploader');
        fileUploaders.forEach(uploader => {
            uploader.addEventListener('change', (e) => {
                const qIndex = e.target.getAttribute('data-q-index');
                const file = e.target.files[0];
                const statusSpan = document.getElementById(`q-file-status-${qIndex}`);
                
                if (file) {
                    if (file.size > 3 * 1024 * 1024) {
                        alert("⚠️ La imagen excede el límite de 3MB. Por favor sube una imagen comprimida.");
                        uploader.value = '';
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        state.tempQFile[qIndex] = event.target.result; // Guardar base64 temporalmente
                        statusSpan.innerText = `✓ Imagen lista (${file.name})`;
                        statusSpan.style.color = "var(--neon-cyan)";
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Configurar botones de "Editar Respuesta"
        const editBtns = document.querySelectorAll('.btn-edit-answer');
        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const q = btn.getAttribute('data-q');
                const editForm = document.getElementById(`edit-form-${q}`);
                const savedAnsBox = document.getElementById(`saved-ans-${q}`);
                const btnSave = document.querySelector(`.btn-save-answer[data-q="${q}"]`);
                
                savedAnsBox.style.display = 'none';
                editForm.style.display = 'flex';
                btnSave.style.display = 'inline-block';
                btn.style.display = 'none';
            });
        });

        // Configurar botones de "Guardar Cambios"
        const saveBtns = document.querySelectorAll('.btn-save-answer');
        saveBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const q = btn.getAttribute('data-q');
                const editForm = document.getElementById(`edit-form-${q}`);
                const savedAnsBox = document.getElementById(`saved-ans-${q}`);
                const inputField = document.getElementById(`q-input-${q}`);
                const btnEdit = document.querySelector(`.btn-edit-answer[data-q="${q}"]`);
                
                const texto = inputField.value;
                
                // Si hay una nueva imagen cargada en base64, la usamos. Si no, conservamos la que había.
                let imagen = state.cuestionarioRespuestas[q]?.imagen || '';
                if (state.tempQFile[q] && state.tempQFile[q] !== '') {
                    imagen = state.tempQFile[q];
                    state.tempQFile[q] = ''; // Limpiar el buffer temporal
                }
                
                // Actualizar base de datos del estado
                state.cuestionarioRespuestas[q] = { texto, imagen };
                
                // Guardar en LocalStorage
                localStorage.setItem('penicillium_answers_v2', JSON.stringify(state.cuestionarioRespuestas));
                
                // Re-renderizar la UI para esta tarjeta
                renderQuestionnaire();
                
                // Regresar estados visibles
                editForm.style.display = 'none';
                savedAnsBox.style.display = 'block';
                btn.style.display = 'none';
                btnEdit.style.display = 'inline-block';
            });
        });

        // Configurar botones de "Borrar Todo"
        const deleteBtns = document.querySelectorAll('.btn-delete-answer');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const q = btn.getAttribute('data-q');
                if (confirm(`¿Estás seguro de que deseas borrar la respuesta e imagen de la Pregunta ${q}?`)) {
                    // Resetear el estado para esta pregunta
                    state.cuestionarioRespuestas[q] = { texto: '', imagen: '' };
                    state.tempQFile[q] = '';
                    
                    // Guardar en LocalStorage
                    localStorage.setItem('penicillium_answers_v2', JSON.stringify(state.cuestionarioRespuestas));
                    
                    // Limpiar el selector de archivos
                    const fileInput = document.getElementById(`q-file-${q}`);
                    if (fileInput) fileInput.value = '';
                    
                    renderQuestionnaire();
                    
                    // Forzar el estado de vista no editable
                    const editForm = document.getElementById(`edit-form-${q}`);
                    const savedAnsBox = document.getElementById(`saved-ans-${q}`);
                    const btnSave = document.querySelector(`.btn-save-answer[data-q="${q}"]`);
                    const btnEdit = document.querySelector(`.btn-edit-answer[data-q="${q}"]`);
                    
                    editForm.style.display = 'none';
                    savedAnsBox.style.display = 'block';
                    btnSave.style.display = 'none';
                    btnEdit.style.display = 'inline-block';
                }
            });
        });
    };
    
    // Función auxiliar para sanitizar las entradas de texto
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // ----------------------------------------------------
    // 13. UTILITY INITIALISERS (RGB solvers)
    // ----------------------------------------------------
    const hexToRGBA = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Initialize simulation
    bindMediumToggleListeners();
    drawGrowthCurveChart();
    initQuestionnaireEvents();
    renderQuestionnaire();
    renderTableLogs();

});

