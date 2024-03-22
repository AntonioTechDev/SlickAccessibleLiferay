[#-- 
	SCOPO:
	
	CREARE UN CONTENITORE IN QUI QUALSIASI GRIGLIA NATIVA DEL PORTALE DIVENTASSE UN CAROSELLO CONFIGURABILE

	SPIEGAZIONE

	Tramite le varie col dell'elemento griglia si va a definire quanti elementi visualizzare in ogni breackpoint all'interno del carosello
	Ad ogni cambio pagina o ricaricamento viene re-inzializzato lo slider
	Viene usato un try-catch per gesitre gli errori e riprovare in caso in cui lo slider non viene inizializzato

--]

[#assign is_edit_mode = portletDisplay.getId()?ends_with ("_ContentPageEditorPortlet") /]
[#if is_edit_mode]
	<div role="alert" class="alert alert-danger m-2" aria-live="assertive">
		<h2>
			<strong>ATTENZIONE - Messaggio per il Redattore:</strong>
		</h2>
		<p>
		Per abilitare l'opzione <strong>"Zoom del Carosello al click"</strong>, assicurati che le slide non contengano link. Se ci sono link nelle slide, l'opzione di zoom non funzionera.
		</p>
	</div>
[/#if]

<p 
	 id="${fragmentEntryLinkNamespace}__narrator" 
	 role="status" 
	 aria-live="assertive" 
	 class="sr-only __narrator"
>
</p>

<div class="slider-wrapper
						[#if configuration.zoomSlide]zoom-active[/#if]
		 				[#if configuration.fullView]full-container[/#if]"
		 				id="${fragmentEntryLinkNamespace}"
>
	
	<div class="slider
							${configuration.partialSlide}
							${configuration.showDeviceArrows}
							${configuration.showDeviceDots}"
	> 	
		
		<lfr-drop-zone></lfr-drop-zone>
		
  </div>
</div>

[#if configuration.zoomSlide]
  <!-- Modal -->

	<dialog 
					class="modal fade"
					id="${fragmentEntryLinkNamespace}-modal" 
					tabindex="-1"
					aria-labbeledby="${fragmentEntryLinkNamespace}-modal-label"
		>
		
		<div 
				 class="modal-dialog modal-xl"
		>
			<div class="modal-content">
			<div class="modal-header">
				<h2 
						class="modal-title"
						id="${fragmentEntryLinkNamespace}-modal-label"
						tabindex="0"
				>
					Modal title
				</h2>
				<button 
								type="button"
								class="close close-button btn btn-secondary sm"
								data-dismiss="modal"
								aria-label="Close"
				>
					<span 
								class="close-icon" 
								aria-hidden="true"
					>
						&times;
					</span>
				</button>
			</div>
			<div 
					 class="modal-body" 
					 data-initialized="false"
			>
				<!-- slide -->
			</div>
			<div class="modal-footer">
      </div>
			</div>
		</div>
	</dialog>
[/#if]
