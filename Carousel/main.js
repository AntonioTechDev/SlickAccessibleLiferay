var sr_narrator = $(fragmentElement).find('.__narrator');
var alertModal = $(fragmentElement).find('[id*="__alert-modal"');
var dialog = $(fragmentElement).find('.modal');
var modalTitle = $(fragmentElement).find('.modal .modal-title');
var closeButtonModal = $(fragmentElement).find('.close');

var sliderWrapper =  $(fragmentElement).find('.slider-wrapper'); 
var sliderContainer =  $(fragmentElement).find('.slider-wrapper .slider'); 

var $modalSlideContainer = $(fragmentElement).find('.modal .modal-body');
var lastAction = 'next'; 
var numberSlidesToScroll = 1;
var nextSlide = 0;

var isRowDelete = false;
var isSlideInitialized = false;
var isModalInitialized = false;
var isTabIndexInitialized = false;
var isAriaLabelInitialized = false;
var centerModeBoolean = false;
var carouselActive = false; 

$(document).ready(function() {
    var resizeTimer;
    try {
        initSlider();
    } catch (error) {
        console.error('Errore durante l\'inizializzazione dello slider:', error);
    }

    Liferay.on('popstate', function() {
        try {
            initSlider();
        } catch (error) {
            console.error('Errore durante l\'inizializzazione dello slider su popstate:', error);
        }
    });

    $(window).resize(function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            try {
                initSlider();
            } catch (error) {
                console.error('Errore durante l\'inizializzazione dello slider dopo resize:', error);
            }
        }, 500);
    });
});

function initSlider() {
    var currentSlideIndex;
    var $slider;
    var isCollection = false;
    var $selector;
    var totalItems = 0;
    var $largeSlide, $mediumSlide, $smallSlide, $extraSmallSlide;  
    var smallClassFound = false, mediumClassFound = false, largeClassFound = false;
    var firstColumnElement;
    var prevSlideText, nextSlideText;

    var zoomSlide = configuration.zoomSlide;

    if (!$('body').hasClass('has-edit-mode-menu')) {
        isCollection = $('#' + fragmentEntryLinkNamespace).find('.slider .lfr-layout-structure-item-collection').length > 0;

        if(isCollection) {
            $selector = '.slider-wrapper .slider .lfr-layout-structure-item-collection > .container-fluid';
        } else {
            $selector = '.slider-wrapper .slider > div > [class^="lfr-layout-structure-item"] .row';
        }

        $slider = $(fragmentElement).find($selector);

        /** ------------------------------- LOGICA NUMERO ELEMENTI SLIDER-----------------------------------------------------
         *  Il codice estrae le classi "col" di Bootstrap dagli elementi delle griglie per determinare il numero di elementi visibili per breakpoint nello slider.
         */

        if ($slider.hasClass('slick-initialized')) {
            firstColumnElement = $slider.find('.slick-track .slick-slide [class*="col-"]').first();
            totalItems = $slider.slick('getSlick').slideCount;
        } else {
            firstColumnElement = $slider.find('[class*="col-"]').first();
            console.log("firstColumnElement: ", firstColumnElement);
            console.log("firstColumnElement: "+ firstColumnElement);
            if(isCollection && !isRowDelete) {
                totalItems = $slider.find('.row').children().length;
            }else {
                totalItems = $slider.children().length;
            }
        }

        if (firstColumnElement && firstColumnElement.attr('class')) {
            var classList = firstColumnElement.attr('class').split(/\s+/);

            $.each(classList, function(index, item) {
                if (item.indexOf('col-lg-') > -1) {
                    $largeSlide = parseInt(item.split('-')[2]);
                    largeClassFound = true;
                }

                if (item.indexOf('col-md-') > -1) {
                    $mediumSlide = parseInt(item.split('-')[2]);
                    mediumClassFound = true;
                }

                if (item.indexOf('col-sm-') > -1) {
                    $smallSlide = parseInt(item.split('-')[2]);
                    smallClassFound = true;
                }
            });

            $largeSlide = largeClassFound ? 12 / $largeSlide : 3;
            $mediumSlide = mediumClassFound ? 12 / $mediumSlide : 2;
            $smallSlide = smallClassFound ? 12 / $smallSlide : 1;
            $extraSmallSlide = 1;

            console.log("$largeSlide: " + $largeSlide);
        }
        
        var slidesToShowBasedOnBreakpoint = calculateSlidesForBreakpoint($largeSlide, $mediumSlide, $smallSlide, $extraSmallSlide);
        /** ----------Fine LOGICA NUMERO ELEMENTI SLIDER -------------------------------------------------------------------------------- */

        /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
        \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

        /** 
         * --------------LOGICA MODALE------------------------------------------------------------------------------------------
         * Questa sezione gestisce la preparazione e l'inizializzazione di uno slider all'interno di una modale.
         * 
         * L'approccio adottato consiste nel clonare il contenitori con gli elementi che diventerrano slider presenti nella pagina e inserirli all'interno della modale.
         * Successivamente, il contenitore viene inizializzato con Slick Slider, trasformandolo in uno slider funzionale
         * anche all'interno della modale.
         * 
        */
			
        if ($modalSlideContainer.length > 0 && !isModalInitialized) {
            var $originalSlider = $(fragmentElement).find('.slider-wrapper .slider');
            var $clonedSlider = $originalSlider.clone();
            isModalInitialized = true;

            $modalSlideContainer.append($clonedSlider);

            if(isCollection) {
               $modalSlideContainer = $modalSlideContainer.find(".slider .lfr-layout-structure-item-collection > .container-fluid");
            } else {
               $modalSlideContainer = $modalSlideContainer.find('.slider > div > [class^="lfr-layout-structure-item"] .row');
            }

            $modalSlideContainer.data('initialized', true);
            $modalSlideContainer.attr('data-initialized', 'true');
			
            $modalSlideContainer.slick({    
                infinite: true,
                prevArrow: prevArrowHTML(),
                nextArrow: nextArrowHTML(),
                slidesToScroll: 1,
                slidesToShow: 1,
                arrows: true,
                fade: true,
                speed: 200,
                cssEase: 'linear',
                responsive: [
                    {
                        breakpoint: 570,
                        settings: {
                            arrows: false,
                            dots: true,
                            customPaging: function (slider, i) {
                                var startSlideNumber = (i * slidesToShowBasedOnBreakpoint) + 1;
                                var endSlideNumber = Math.min(startSlideNumber + slidesToShowBasedOnBreakpoint - 1, slider.slideCount);
                                var textForScreenReader = '';
                            
                                if (slidesToShowBasedOnBreakpoint > 1) {
                                    textForScreenReader = `Visualizza le prossime ${slidesToShowBasedOnBreakpoint} slides da ${startSlideNumber} a ${endSlideNumber} di ${slider.slideCount}`;
                                } else {
                                    textForScreenReader = `Vai alla slide ${startSlideNumber} di ${slider.slideCount}`;
                                }
                                
                                return customPagingHTML(textForScreenReader);
                            }
                        }
                    }
                ]
            });

            /* --------------------------------------------------------------
            ----------------MODAL EVENT LISTENER------------------------------
            -------------------------------------------------------------------
            */

            if(!isAriaLabelInitialized) {
                updateAriaLabelsWithAlt($modalSlideContainer);
                updateSlideAttributes($modalSlideContainer);
                var slickInstance = $modalSlideContainer.slick('getSlick');
                updateSlideArrowText($modalSlideContainer, nextSlide, slickInstance.slideCount, slickInstance.options.slidesToShow, slickInstance.options.slidesToScroll, slickInstance.options.infinite, slickInstance.options.centerMode);
            }

            moveSlickDotsToNav($modalSlideContainer, configuration.textAriaLabelNavigationDotsCarousel);

            // Quando apri la modale, nascondi gli elementi allo screen reader
            dialog.on('show.bs.modal', function() {
                // Imposta aria-hidden su true su tutti gli elementi con aria-label
                $(this).find('[aria-label]').attr('aria-hidden', 'true');
            });

            // Quando un elemento riceve il focus, rendilo visibile allo screen reader
            dialog.on('focusin', '[aria-label]', function() {
                $(this).removeAttr('aria-hidden');
            });

            // Quando la modale viene chiusa, ripristina lo stato originale degli attributi
            dialog.on('hidden.bs.modal', function() {
                $(this).find('[aria-label]').removeAttr('aria-hidden');
            });

            closeButtonModal.on('click', function() {
                updateSrNarrator("La modale si e' chiusa correttamente");
            });

            $modalSlideContainer.on('afterChange', function(event, slick, currentSlide) {
                var textAriaLabel = $modalSlideContainer.find('.slick-slide.slick-current.slick-active').attr("aria-label");
                if (modalTitle.length > 0 && textAriaLabel) {
                    modalTitle[0].innerHTML = textAriaLabel; 
                }
                updateSlideAttributes($modalSlideContainer);
            });

            $modalSlideContainer.find('.slick-next').on('click', function() {
                lastAction = 'next';
                updateSrNarrator("Click avanti riuscito");
            });
            
            $modalSlideContainer.find('.slick-prev').on('click', function() {
                lastAction = 'back';
                updateSrNarrator("Click indietro riuscito");
            });

            $modalSlideContainer.on('beforeChange', function(event, slick, currentSlide, nextSlide){
                updateSlideArrowText($modalSlideContainer, nextSlide, slick.slideCount, slick.options.slidesToShow, slick.options.slidesToScroll, slick.options.infinite, slick.options.centerMode);
            });   
        }
        
        console.log("totalItems" + totalItems);
        console.log("slidesToShowBasedOnBreakpoint" + slidesToShowBasedOnBreakpoint);

        carouselActive = configureDisplayMode();
        console.log("attiva carosello: " , carouselActive);

        /** ---------FINE LOGICA MODALE------------------------------------------------------------------------------------------------------------------ */

        if (totalItems > slidesToShowBasedOnBreakpoint && carouselActive) {  

            /** 
             * Rimuove le row generate automaticamente dalle collection di Liferay per ottimizzare l'implementazione del carosello.
             * Gli elementi di ciascuna row vengono trasferiti al contenitore padre prima di eliminare le row stesse, 
             * consentendo al carosello di funzionare correttamente solo sugli elementi desiderati.
            */

            console.log('isCollection:', isCollection);

            // Debug per verificare se $slider ha la classe 'slick-initialized'
            console.log('$slider.hasClass(\'slick-initialized\'):', $slider.hasClass('slick-initialized'));

            if(isCollection && !$slider.hasClass('slick-initialized')){
                var $container = $slider;
                var $rows = $container.find('.row');
                console.log("proviamo");

                $rows.each(function() {
                    var row = $(this);

                    row.children().each(function() {
                        var child = $(this);
                        $container.append(child);
                    });

                    row.remove();
                    console.log("proviamo");
                });

                isRowDelete = true;
            }

            centerModeBoolean = (configuration.partialSlide === "true");   

            // Quando il center mode e attivo si scorre sempre di 1 slide. 
            if(centerModeBoolean) {
                numberSlidesToScroll = 1;
            }else{
                numberSlidesToScroll = slidesToShowBasedOnBreakpoint;
            }

            /* 
                All'interno di customPaging eseguo una funzione per riuscire a printare un messaggio per sr che indica scorrendo avanti quali slide si vedranno
            */
            
            var sliderOptions = {
                infinite: configuration.infinite,
                dots: true,
                customPaging: function (slider, i) {
                    var startSlideNumber = (i * numberSlidesToScroll) + 1;
                    var endSlideNumber = Math.min(startSlideNumber + numberSlidesToScroll - 1, slider.slideCount);
                    var textForScreenReader = '';
                
                    if (numberSlidesToScroll > 1) {
                        textForScreenReader = `Visualizza le prossime ${numberSlidesToScroll} slides da ${startSlideNumber} a ${endSlideNumber} di ${slider.slideCount}`;
                    } else {
                        textForScreenReader = `Vai alla slide ${startSlideNumber} di ${slider.slideCount}`;
                    }
                    
                    return customPagingHTML(textForScreenReader);
                },
                prevArrow: prevArrowHTML(),
                nextArrow: nextArrowHTML(),
                arrows: true,
                autoplay: false,
                autoplaySpeed: configuration.slideDuration,
                speed: 200,
                slidesToShow: slidesToShowBasedOnBreakpoint,
                adaptiveHeight: true,
                centerMode: centerModeBoolean,
                centerPadding: '60px',
                slidesToScroll: numberSlidesToScroll,
                responsive: [
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: $mediumSlide,
                            slidesToScroll: $mediumSlide,
                            centerMode: false,
                            centerPadding: '40px'
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: $smallSlide,
                            slidesToScroll: $smallSlide,
                            centerMode: false,
                            centerPadding: '40px'
                        }
                    },
                    {
                        breakpoint: 576,
                        settings: {
                            slidesToShow: $extraSmallSlide,
                            slidesToScroll: $extraSmallSlide,
                            centerMode: centerModeBoolean,
                            centerPadding: '40px'
                        }
                    }
                ]
            };   
						
            $slider.not('.slick-initialized').slick(sliderOptions);

                                
             /*------------------------------------------------------------------------------------------
            ------------------SLIDER EVENT LISTENER----------------------------------------------------
            ------------------------------------------------------------------------------------------*/

            /*
                LEGGI LEGGI !!

                Al caricamento della pagina, tutte le slide attive (.slick-active) ricevono tabindex="0" per essere accessibili via tastiera. In base all'azione dell'utente:

                Freccia Avanti: Assegna tabindex="0" alla prima slide attiva, focalizzandosi sull'inizio del set visibile.
                Freccia Indietro: Assegna tabindex="0" all'ultima slide attiva, focalizzandosi sulla fine del set visibile.
                Quando una slide attiva entra in focus, tutte le altre slide attive diventano tabbabili impostando tabindex="0" su di esse. 
                Questo accade grazie all'evento focusin che da tabindex = 0 a tutte le altre slide attive  
            */ 

            if(!isAriaLabelInitialized) {
                updateAriaLabelsWithAlt($slider);
                updateSlideAttributes($slider);
                isAriaLabelInitialized = true;
                var slickInstance = $slider.slick('getSlick');
                updateSlideArrowText($slider, nextSlide, slickInstance.slideCount, slickInstance.options.slidesToShow, slickInstance.options.slidesToScroll, slickInstance.options.infinite, slickInstance.options.centerMode);            
            }

            moveSlickDotsToNav($slider, configuration.textAriaLabelNavigationDotsCarousel);

            $slider.on('focusin', '.slick-active', function() {
                $(this).closest('.slick-list').find('.slick-active').attr('tabindex', '0');
            });

            $slider.find('.slick-next').on('click', function() {
                lastAction = 'next';
                updateSrNarrator("Click avanti riuscito - clica shift+tab per andare in focus sulla slide");
            });
            
            $slider.find('.slick-prev').on('click', function() {
                lastAction = 'back';
                updateSrNarrator("Click indietro riuscito - clicca tab per andare in focus sulla slide");
            });

            $slider.find('.slick-autoplay-toggle-button').on('click', function(e) {
                // Determina quale icona e attualmente visibile e aggiorna di conseguenza
                var text;
                if ($slider.find('.slick-autoplay-toggle-button .slick-pause-icon').is(':visible')) {
                    text = 'il carosello sta scorrendo in modo automatico - andando avanti con "TAB" il carosello si blocchera automaticamente';
                } else {
                    text = 'il carosello e in pausa';
                }
                updateSrNarrator(text);
                
            });
            
            $slider.on('afterChange', function(event, slick, currentSlide) {
                updateSlideAttributes($slider);
            });

            $slider.on('beforeChange', function(event, slick, currentSlide, nextSlide){
                updateSlideArrowText($slider, nextSlide, slick.slideCount, slick.options.slidesToShow, slick.options.slidesToScroll, slick.options.infinite, slick.options.centerMode);
            });   

            $slider.on('click', '.slick-dots li button', function() {
                // Attendi che Slick abbia cambiato slide
                setTimeout(function() {
                    var targetSlide = $slider.find('.slick-slide.slick-current.slick-active');
                    if (targetSlide.length > 0) {
                        targetSlide.attr('tabindex', '0').focus();
                    } else {
                        console.log('La slide target non e stata trovata.');
                    }
                }, 300); 
            });
        
            /** --------------------------------------------------------------------------------------------------------------*/

            /** 
             * All'apertura della modale viene fatto uno slickGoTo per forzare un ridimensionamento delle slide all'interno dello slider della modale.
             * Altrimenti le slide slick non sono dimensionati correttamente
            */

            $slider.on('keypress', '.slick-slide', function(e) {
                if (e.which === 13) {
                    $(this).click();
                }
            });

            $slider.on('click', '.slick-slide', function() {
                currentSlideIndex = $(this).data('slick-index');

                if ($modalSlideContainer.length > 0) {
                    if (currentSlideIndex === 0) {
                        $modalSlideContainer.slick('slickGoTo', 1);
                    }else{
                        $modalSlideContainer.slick('slickGoTo', currentSlideIndex);
                    }

                    dialog.on('shown.bs.modal', function () {
                        modalTitle.focus();
                    });                    
				}
            });

            /** ------------------------------------------------------------------------------------------------------------ */

        } else {
            if ($slider.hasClass('slick-initialized')) {
                $slider.slick('unslick');
                console.log("slider: " , $slider);

                // Crea un nuovo div con classe 'row' e lo inserisce all'interno dello slider
                var $row = $('<div>').addClass('row');
                $slider.append($row);

                // Sposta tutti i div (colonne) esistenti all'interno del nuovo div 'row'
                $slider.children('div:not(.row)').appendTo($row);

                isRowDelete = false;
            }
        }
    } else {
        console.log("La classe 'has-edit-mode-menu' presente. Non inizializzo lo slider.");
    }

    /** ----------------------------------------------------------------------------------------- */

    /**
     * Determina il numero di slide da visualizzare in un carosello basato sui breakpoint di larghezza dello schermo.
     * Questa funzione permette di adattare il numero di slide visualizzate in un carosello alla larghezza corrente della finestra
     *
     * @param {Number} $largeSlide - Il numero di slide da visualizzare su schermi larghi (larghezza >= 992px).
     * @param {Number} $mediumSlide - Il numero di slide da visualizzare su schermi medi (larghezza >= 768px e < 992px).
     * @param {Number} $smallSlide - Il numero di slide da visualizzare su schermi piccoli (larghezza >= 576px e < 768px).
     * @param {Number} $extraSmallSlide - Il numero di slide da visualizzare su schermi extra-piccoli (larghezza < 576px).
     *
     * @returns {Number} Il numero di slide da visualizzare basato sulla larghezza corrente della finestra del browser.
     */

    function calculateSlidesForBreakpoint ($largeSlide, $mediumSlide, $smallSlide, $extraSmallSlide) {
        var screenWidth = $(window).width();
        if (screenWidth >= 992) { 
            return $largeSlide;
        } else if (screenWidth >= 768) { 
            return $mediumSlide;
        } else if (screenWidth >= 576) { 
            return $smallSlide;
        } else { 
            return $extraSmallSlide;
        }
    }

    /**
     * Determina se attivare la modalità carosello in base alla larghezza attuale della finestra del browser.
     * Questa funzione controlla la larghezza della finestra e decide se il contenuto deve essere visualizzato
     * come carosello o come griglia standard. La decisione si basa su valori di configurazione predefiniti
     * che possono essere impostati dall'utente attraverso l'interfaccia di configurazione.
     *
     * @returns {boolean} carouselActive - Ritorna true se la modalità carosello è attiva per il breakpoint
     * corrente, altrimenti false. Questo valore booleano può essere utilizzato per inizializzare o distruggere
     * il carosello a seconda delle esigenze.
     *
     * I breakpoint sono definiti come segue:
     * - Extra Small: meno di 576px
     * - Small: da 576px a 767px
     * - Medium: da 768px a 991px
     * - Large: 992px e oltre
     *
     * Ogni breakpoint ha una propria configurazione (carouselXs, carouselSm, carouselMd, carouselLg)
     * che può essere impostata per attivare o disattivare la modalità carosello.
     */
    function configureDisplayMode() {
        var screenWidth = $(window).width();
        var carouselActive = false; 

        if (screenWidth < 576) {
            carouselActive = configuration.carouselXs;
        } else if (screenWidth >= 576 && screenWidth < 768) {
            carouselActive = configuration.carouselSm;
        } else if (screenWidth >= 768 && screenWidth < 992) {
            carouselActive = configuration.carouselMd;
        } else if (screenWidth >= 992) {
            carouselActive = configuration.carouselLg;
        }

        return carouselActive;
    }

    /*-------------------------------------------------------------------------------------------------
     ------------------------FUNZIONI DI ACCESSIBILITA'----------------------------------------------
     ------------------------------------------------------------------------------------------------- 
    */

       /**
     * Calcola e aggiorna direttamente i testi e gli attributi title per le frecce di navigazione del carosello.
     * Questa funzione adatta il testo sulle frecce di navigazione alle varie configurazioni del carosello, 
     * supportando sia la modalita normale che la modalita centro. Gestisce anche correttamente i caroselli infiniti,
     * assicurando che l'utente riceva sempre indicazioni appropriate su come navigare tra le slide.
     * Oltre a calcolare i testi per le frecce, questa funzione aggiorna direttamente il testo visibile
     * e l'attributo title delle frecce di navigazione (indietro e avanti), migliorando l'accessibilita e fornendo
     * una guida chiara all'utente su come interagire con il carosello.
     *
     * @param {$Object} $slider - L'elemento jQuery del carosello su cui operare.
     * @param {Number} nextSlide - L'indice della prossima slide verso cui si sta navigando.
     * @param {Number} totalSlides - Il numero totale di slide nel carosello.
     * @param {Number} slidesToShow - Il numero di slide visibili in un dato momento nel carosello.
     * @param {Number} slidesToScroll - Il numero di slide che il carosello scorre con ogni navigazione.
     * @param {Boolean} infinite - Indica se il carosello deve avvolgersi infinitamente.
     * @param {Boolean} centerMode - Indica se il carosello e in modalita centro, dove la slide attiva e centrata.
     *
     * @returns {void} La funzione non restituisce un valore, ma aggiorna direttamente gli elementi nel DOM.
     */
       function updateSlideArrowText($slider, nextSlide, totalSlides, slidesToShow, slidesToScroll, infinite, centerMode) {
        var prevStartSlide, prevEndSlide, prevSlideText, nextSlideText, nextStartSlide, nextEndSlide;
    
        if (centerMode) {
            // Gestisce la logica per le frecce indietro e avanti in modalita center.
            prevStartSlide = nextSlide === 0 && infinite ? totalSlides : Math.max(1, nextSlide);
            prevEndSlide = nextSlide + 1 >= totalSlides && infinite ? 1 : Math.min(totalSlides, nextSlide + 2);
    
            if (prevStartSlide === 1) {
                prevSlideText = `Torna alla slide ${totalSlides} di ${totalSlides}`;
            } else {
                prevSlideText = `Torna alla slide ${prevStartSlide - 1} di ${totalSlides}`;
            }
    
            if (prevEndSlide + 1 > totalSlides) {
                nextSlideText = `Vai alla slide 1 di ${totalSlides}`;
            } else {
                nextSlideText = `Vai alla slide ${prevEndSlide + 1} di ${totalSlides}`;
            }
        } else {

            // Gestisce la logica per le frecce indietro e avanti in modalita normale.
            var prevStartSlide, prevEndSlide;
            if (nextSlide === 0 && infinite) {
                prevStartSlide = totalSlides - slidesToShow + 1;
                prevEndSlide = totalSlides;
            } else {
                prevStartSlide = Math.max(1, nextSlide - slidesToScroll + 1);
                prevEndSlide = Math.min(totalSlides, nextSlide);
            }

            var isAtEnd = nextSlide + slidesToShow >= totalSlides;

            nextStartSlide = isAtEnd && infinite ? 1 : Math.min(totalSlides, nextSlide + slidesToShow + 1);
            nextEndSlide = isAtEnd && infinite ? slidesToShow : Math.min(totalSlides, nextStartSlide + slidesToShow - 1);

            prevSlideText = `Visualizza le slide da ${prevStartSlide} a ${prevEndSlide} di ${totalSlides}`;
            nextSlideText = `Visualizza le slide da ${nextStartSlide} a ${nextEndSlide} di ${totalSlides}`;
        }

        // Trova e aggiorna l'elemento della freccia precedente.
        var $prevArrow = $slider.find('.slick-prev');
        $prevArrow.find('.arrow-text').text(prevSlideText);
        $prevArrow.attr('title', prevSlideText);
    
        // Trova e aggiorna l'elemento della freccia successiva.
        var $nextArrow = $slider.find('.slick-next');
        $nextArrow.find('.arrow-text').text(nextSlideText);
        $nextArrow.attr('title', nextSlideText);
    }

    /**
     * Migliora l'accessibilita delle slide in un carosello Slick aggiungendo il testo alternativo (alt) delle immagini all'attributo aria-label delle slide corrispondenti. 
     * Questo permette agli screen reader di fornire una descrizione piu ricca delle immagini presenti nelle slide per gli utenti con disabilita visive.
     *
     * @param {jQuery} slider - L'elemento jQuery del carosello Slick. Assicurati che sia gia stato inizializzato come carosello Slick.
     *
     * La funzione itera su tutte le slide del carosello specificato, cercando immagini con un attributo alt definito.
     * Per ogni immagine trovata, il suo testo alternativo viene aggiunto all'aria-label della slide contenente, migliorando
     * l'accessibilita senza modificare visivamente il contenuto del carosello.
     */

    function updateAriaLabelsWithAlt(slider) {
        $(slider).find('.slick-slide').each(function() {
            var slide = $(this); 
            var targetElement = slide.find('[id^="fragment"] img'); 
    
            if(targetElement.length > 0) {
                var altText = targetElement.attr('alt');
    
                if(altText) {
                    // Recupera il valore attuale di aria-label, se non esiste imposta una stringa vuota
                    var currentAriaLabel = slide.attr('aria-label') || '';
                    // Aggiorna l'aria-label con il testo attuale pi il valore dell'alt recuperato
                    slide.attr('aria-label', `${currentAriaLabel} - ${altText}`);
                }
            }
        });
    }

    /**
     * Aggiorna gli attributi delle slide in un carosello Slick per migliorare l'accessibilita e gestire comportamenti specifici
     * in relazione alla presenza di modali e alla navigazione tramite tastiera.
     *
     * @param {jQuery} slider - L'elemento jQuery del carosello Slick a cui applicare le modifiche.
     *
     * La funzione esegue diverse operazioni critiche per l'accessibilita e l'usabilita:
     * - Imposta il tabindex di tutte le slide non attive o clonate su '-1', per evitare che gli utenti di screen reader
     *   possano selezionarle durante la navigazione tramite tastiera.
     * - Determina e assegna il tabindex '0' alla slide attiva corretta, basandosi sull'azione dell'utente (avanti o indietro)
     *   e se il carosello e in modalita centro, per garantire che la navigazione tramite tastiera sia logica e intuitiva.
     * - Se le slide fungono da trigger per una modale, imposta il ruolo 'button' per indicare chiaramente la funzionalita interattiva.
     * - Per le slide che fungono da trigger per la modale, aggiunge gli attributi
     *   necessari per attivare la modale di Bootstrap.
     * 
     *  Quando una slide attiva entra in `focus`, tutte le altre slide attive diventano tabbabili impostando tabindex="0" su di esse. 
        Questo accade grazie `all'evento focusin` che da tabindex = 0 a tutte le altre slide con classe `.slick-active`
     *
     * Questa funzione presuppone l'esistenza di variabili:
     *  - `isTabIndexInitialized`
     *  - `lastAction`,
     *  - `centerModeBoolean`
     *  - `configuration`, 
     *  
     *
     */
    function updateSlideAttributes(slider) {
        var firstActiveFound = false;
        var isModalSlider = $(slider).closest('.modal').length > 0;

        $(slider).find('.slick-slide').each(function(index) { 
            var slideElement = $(this);  

            if (slideElement.hasClass("slick-cloned") || !slideElement.hasClass("slick-active")) {
                slideElement.attr('tabindex', '-1');
            }

            if (slideElement.hasClass("slick-active") && !slideElement.hasClass("slick-cloned")) {
                if (!firstActiveFound && isTabIndexInitialized) {
                    if(lastAction == "next") {
                        // se il carosello ha l'opzione center mode attiva il tab index viene gestito diversamente per far si 
                        // che un utente con sr non visualizzi due volte la stessa slide
                        if(centerModeBoolean == true) {
                            $(slider).find('.slick-slide.slick-active').last().attr('tabindex', '0');
                        } else {
                            slideElement.attr('tabindex', '0');
                        }
                    } else if(lastAction == "back") {
                        if (centerModeBoolean == true) {
                            slideElement.attr('tabindex', '0');
                        } else {
                            $(slider).find('.slick-slide.slick-active').last().attr('tabindex', '0');
                        }
                    }
                    firstActiveFound = true; 
                } else if(!isTabIndexInitialized) {
                    slideElement.attr('tabindex', '0');
                }   

                checkLinkElement(slideElement);

                // viene aggiunto solo se le slide fungono da trigger per la modale
                if(zoomSlide) {
                    slideElement.attr('role', 'button');
                }
            }

            /** Questi attributi sfruttano il js di boostrap per fare aprire la modale */
            if(zoomSlide && !isModalSlider) {
                if (slideElement.hasClass("slick-link-slide")) {
                    isSlideInitialized = true;
                } else {
                    slideElement.attr('data-target', '#' + fragmentEntryLinkNamespace + '-modal');
                    slideElement.attr('data-toggle', 'modal');
                    slideElement.addClass('slick-link-slide');
                }
            }
        });

        if(!isModalSlider) {
            isTabIndexInitialized = true;
        }
    }

    /**
     * Aggiorna il testo di un elemento dedicato agli annunci degli screen reader per migliorare l'accessibilita.
     * Questa funzione assicura che gli aggiornamenti del testo siano riconosciuti e vocalizzati correttamente dagli screen reader,
     * utilizzando un breve ritardo per resettare il contenuto prima di inserire il nuovo testo.
     *
     * @param {String} text
     * 
    * */
    function updateSrNarrator(text) {
        sr_narrator.text(' ');
    
        setTimeout(function() {
            sr_narrator.text(text);
        }, 100);
    }

    /**
     * Sposta `.slick-dots` in un `<nav>` con classe semantica e `aria-label` per migliorare l'accessibilit .
     * Crea un nuovo elemento `<nav>` con la classe `slider-navigation-dots` e l'`aria-label` fornito,
     * e vi sposta `.slick-dots`. Se un `<nav>` appropriato esiste gi , riutilizza quello.
     * 
     * @param {String} selector - Sevartore CSS/JQuery del carosello Slick.
     * @param {String} textAriaLabelNavigation - Testo per l'`aria-label` del `<nav>`, descrive la navigazione.
     */

    function moveSlickDotsToNav(selector, textAriaLabelNavigation) {
        var slickDotsElement = $(selector).find('.slick-dots');    
        
        if (slickDotsElement.length) {    
            // Usa una classe custom per identificare il <nav>
            var existingNavElement = $(selector).find('nav.slider-navigation-dots');
        
            // Crea un nuovo <nav> solo se non ne esiste gi  uno con la classe specificata
            var navElement;
            if (existingNavElement.length === 0) {
                navElement = $('<nav>', {
                    'role': 'navigation',
                    'aria-label': textAriaLabelNavigation,
                    'class': 'slider-navigation-dots'
                }).appendTo(selector);
            } else {
                navElement = existingNavElement;
            }
    
            // Sposta .slick-dots nel <nav> se non   gi  l 
            if (!slickDotsElement.parent().is(navElement)) {
                navElement.append(slickDotsElement);
            }
        } else {
            console.log('Elemento .slick-dots non trovato.');
        }
    }
    
    /** -------------------------------------------------------------------------------------------------------*/
    
    function customPagingHTML(textForScreenReader) {
        return `
            <button type="button" title="${textForScreenReader}">
                <span class="slick-dot-icon" aria-hidden="true"></span>
                <span class="slick-sr-only">${textForScreenReader}</span>
            </button>`;
    }

    function prevArrowHTML() {
        return `
            <button class="slick-prev slick-arrow" type="button">
                <span class="slick-prev-icon" aria-hidden="true"></span>
                <span class="slick-sr-only arrow-text">Torna indietro di ${numberSlidesToScroll} slides</span>
            </button>`;
    }
    
    function nextArrowHTML() {
        return `
            <button class="slick-next slick-arrow" type="button">
                <span class="slick-next-icon" aria-hidden="true"></span>
                <span class="slick-sr-only arrow-text">Vai avanti di ${numberSlidesToScroll} slides</span>
            </button>`;
    }

    /*----------------------------------------------------------------*/

    /**
     * Verifica se una slide specifica contiene link e aggiorna la variabilita di zoom.
     * Questa funzione controlla se all'interno dell'elemento slide specificato esiste almeno un link.
     * Se viene trovato un link, si assume che la slide non debba fungere da trigger per lo zoom (zoomSlide = false).
     * Altrimenti, se non sono presenti link, la slide puo essere utilizzata come trigger per lo zoom (zoomSlide = true).
     * Questo comportamento e particolarmente utile per distinguere tra slide che devono avere un'interazione di zoom
     * e quelle che contengono link navigabili, evitando cose conflitti nell'interazione dell'utente.
     * 
     * @param {jQuery Object} slideElement - L'elemento jQuery della slide da controllare.
    */
    function checkLinkElement(slideElement){
        var slideHaveLink = $(slideElement).find('[id^="fragment"] a').length > 0;
        if(zoomSlide) {
            if(slideHaveLink) {
                zoomSlide = false;
            } else {
                zoomSlide = true;
            }
        }
    }
}