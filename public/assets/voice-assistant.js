(()=>{var w=class{constructor(){this.recognition=null;this.isProcessingQuery=!1;this.isSpeaking=!1;this.isRecognitionActive=!1;this.currentUtterance=null;this.silenceTimer=null;this.hideHUDTimer=null;this.autoRestartMode=!0;this.tutorVoiceRecognition=null;this.isTutorVoiceActive=!1;this.tutorVoiceBaseText="";this.cameraStream=null;this.tutorWaveContainer=null;this.hudContainer=null;this.transcriptText=null;this.responseText=null;this.dots=[];this.voiceVolume=.95;this.status="sleeping";this.authContainer=null;this.currentAuthTab="login";this.currentSsoProvider=null;this.currentSsoButton=null;this.init()}init(){console.log("[Assistant] Initializing Elyra Vocal Assistant (Background Wake-Word Edition)..."),this.checkAuthStatus(),this.injectStyles(),this.buildHUDWidget(),this.setupRecognition(),window.addEventListener("keydown",t=>{let e=t.target;e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.isContentEditable||t.key.toLowerCase()==="v"&&(console.log("[Assistant] Wakeup triggered via keyboard shortcut."),this.wakeup())}),document.addEventListener("click",()=>{!this.isRecognitionActive&&!this.isSpeaking&&this.startRecognitionLoop()},{once:!0}),setInterval(()=>this.checkForTutorInput(),600)}injectStyles(){let t="elyra-clean-hud-styles";if(document.getElementById(t))return;let e=document.createElement("style");e.id=t,e.textContent=`
      @keyframes elyra-ambient-pulse {
        0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.9; }
        50% { transform: translate(-50%, -2px) scale(1.02); opacity: 1; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 20px 2px rgba(168, 85, 247, 0.2); }
      }
      @keyframes elyra-dot-glow {
        0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; }
        50% { transform: translateY(-7px) scale(1.2); opacity: 1; }
      }
      @font-face {
        font-family: 'Space Grotesk';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/spacegrotesk/v13/V8mQoQDjQSkF_itv77uF9U_P88v8.woff2) format('woff2');
      }

      .elyra-hud-pulse {
        animation: elyra-ambient-pulse 4s infinite ease-in-out;
      }
      .elyra-dot-wave {
        animation: elyra-dot-glow 0.8s infinite ease-in-out;
      }
      @keyframes tutor-wave-pulse {
        0%, 100% { height: 4px; }
        50% { height: 14px; }
      }
      .tutor-wave-bar {
        animation: tutor-wave-pulse 0.7s infinite ease-in-out;
      }
    `,document.head.appendChild(e)}buildHUDWidget(){let t=document.createElement("div");t.id="elyra-hud-capsule",t.className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] bg-neutral-950/90 backdrop-blur-3xl border border-white/10 p-5 rounded-[28px] shadow-[0_24px_60px_rgba(0,0,0,0.85)] flex flex-col items-center gap-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] select-none pointer-events-none transition-all duration-300 transform scale-90 translate-y-6 opacity-0";let e=document.createElement("div");e.className="flex items-center gap-2 h-6 shrink-0";let a=["#4285F4","#EA4335","#FBBC05","#34A853"];for(let l=0;l<4;l++){let d=document.createElement("span");d.className="w-2.5 h-2.5 rounded-full transition-all duration-300",d.style.backgroundColor=a[l],e.appendChild(d),this.dots.push(d)}t.appendChild(e);let i=document.createElement("div");i.className="w-full text-center flex flex-col gap-1 border-b border-white/5 pb-2.5";let o=document.createElement("p");o.className="text-purple-400 font-sans text-[10px] uppercase tracking-widest font-bold select-none opacity-90",o.innerText="You Said",i.appendChild(o);let r=document.createElement("p");r.id="elyra-hud-transcript",r.className="text-neutral-300 font-sans text-sm italic truncate px-2 mt-0.5",r.innerText='Say "Hey Elyra"',i.appendChild(r),this.transcriptText=r,t.appendChild(i);let n=document.createElement("div");n.className="w-full text-center px-1";let s=document.createElement("p");s.id="elyra-hud-response",s.className="text-white font-sans text-base font-medium leading-relaxed max-h-36 overflow-y-auto no-scrollbar scroll-smooth tracking-tight",s.innerText="I am listening...",n.appendChild(s),this.responseText=s,t.appendChild(n),document.body.appendChild(t),this.hudContainer=t}setupRecognition(){let t=window.SpeechRecognition||window.webkitSpeechRecognition;if(!t){console.warn("[Assistant] Web Speech API SpeechRecognition is not supported in this browser."),this.responseText&&(this.responseText.innerText="Speech Recognition API is disabled on your current browser.");return}let e=new t;e.lang="en-US",e.interimResults=!0,e.maxAlternatives=1,e.continuous=!0,e.onstart=()=>{this.isRecognitionActive=!0,console.log("[Assistant] Voice Recognition Loop Started.")},e.onresult=a=>{if(this.isSpeaking||this.isProcessingQuery)return;let i="",o="";for(let n=a.resultIndex;n<a.results.length;++n)a.results[n].isFinal?o+=a.results[n][0].transcript:i+=a.results[n][0].transcript;let r=(o||i).toLowerCase().trim();if(r){if(this.status==="sleeping"){if(r.includes("hey elyra")||r.includes("elyra")){let n=r.indexOf("elyra"),s=r.substring(n+5).trim();s&&s.length>2?(console.log(`[Assistant] Direct Wake & Command identified: "${s}"`),this.wakeup(!0),this.transcriptText&&(this.transcriptText.innerText=s),this.setVisualState("thinking"),this.executeCommand(s)):(console.log("[Assistant] Wake Word Met. Triggering Active Listening HUD..."),this.wakeup())}return}this.status==="listening"&&(this.transcriptText&&(this.transcriptText.innerText=o||i||"Listening for command..."),this.animateDotsOnInput(),this.silenceTimer&&clearTimeout(this.silenceTimer),o?(console.log(`[Assistant] Active command transcript: "${o}"`),this.setVisualState("thinking"),this.executeCommand(o)):this.silenceTimer=setTimeout(()=>{i&&!this.isProcessingQuery&&this.status==="listening"&&(console.log(`[Assistant] Active command timeout. Processing: "${i}"`),this.setVisualState("thinking"),this.executeCommand(i))},1600))}},e.onerror=a=>{console.warn("[Assistant] Speech Recognition loop returned error:",a.error),a.error==="not-allowed"&&(this.autoRestartMode=!1,this.isRecognitionActive=!1)},e.onend=()=>{this.isRecognitionActive=!1,console.log("[Assistant] Voice Recognition ended."),this.autoRestartMode&&!this.isSpeaking&&!this.isProcessingQuery&&setTimeout(()=>this.startRecognitionLoop(),250)},this.recognition=e,this.startRecognitionLoop()}startRecognitionLoop(){if(localStorage.getItem("eduerror_logged_in")==="true"&&!(!this.recognition||this.isRecognitionActive))try{this.recognition.start()}catch(t){console.warn("[Assistant] Failed to start voice recognition loop:",t)}}wakeup(t=!1){this.stopSpeaking(),this.isProcessingQuery=!1,this.transcriptText&&(this.transcriptText.innerText="Listening for command..."),this.responseText&&(this.responseText.innerText="How can I help you today?"),this.hudContainer&&(this.hideHUDTimer&&clearTimeout(this.hideHUDTimer),this.hudContainer.classList.remove("opacity-0","scale-90","translate-y-6","pointer-events-none"),this.hudContainer.classList.add("opacity-100","scale-100","translate-y-0","elyra-hud-pulse")),t||this.playWakeChime(),this.setVisualState("listening")}sleep(){this.stopSpeaking(),this.isProcessingQuery=!1,this.setVisualState("sleeping"),this.hudContainer&&(this.hudContainer.classList.remove("opacity-100","scale-100","translate-y-0","elyra-hud-pulse"),this.hudContainer.classList.add("opacity-0","scale-90","translate-y-6","pointer-events-none")),this.transcriptText&&(this.transcriptText.innerText='Say "Hey Elyra"'),this.startRecognitionLoop()}setVisualState(t){this.status=t,this.dots.forEach(e=>{e.style.animation="",e.style.transform=""}),t==="listening"?this.dots.forEach((e,a)=>{e.style.animation="elyra-dot-glow 0.8s infinite ease-in-out",e.style.animationDelay=`${a*.12}s`}):t==="thinking"?this.dots.forEach((e,a)=>{e.style.animation="elyra-dot-glow 0.4s infinite ease-in-out",e.style.animationDelay=`${a*.08}s`}):t==="speaking"&&this.dots.forEach((e,a)=>{e.style.animation="elyra-dot-glow 1.1s infinite ease-in-out",e.style.animationDelay=`${a*.15}s`})}animateDotsOnInput(){this.status==="listening"&&this.dots.forEach(t=>{let e=Math.floor(Math.random()*8)-4;t.style.transform=`translateY(${e}px)`})}playWakeChime(){try{let t=new(window.AudioContext||window.webkitAudioContext),e=t.createOscillator(),a=t.createGain();e.type="sine",e.frequency.setValueAtTime(880,t.currentTime),a.gain.setValueAtTime(.06,t.currentTime),a.gain.exponentialRampToValueAtTime(.001,t.currentTime+.3),e.connect(a),a.connect(t.destination);let i=t.createOscillator(),o=t.createGain();i.type="sine",i.frequency.setValueAtTime(1174.66,t.currentTime+.07),o.gain.setValueAtTime(0,t.currentTime),o.gain.setValueAtTime(.06,t.currentTime+.07),o.gain.exponentialRampToValueAtTime(.001,t.currentTime+.45),i.connect(o),o.connect(t.destination),e.start(),e.stop(t.currentTime+.35),i.start(t.currentTime+.07),i.stop(t.currentTime+.5)}catch{}}playAckChime(){try{let t=new(window.AudioContext||window.webkitAudioContext),e=t.createOscillator(),a=t.createGain();e.type="sine",e.frequency.setValueAtTime(987.77,t.currentTime),a.gain.setValueAtTime(.04,t.currentTime),a.gain.exponentialRampToValueAtTime(.001,t.currentTime+.18),e.connect(a),a.connect(t.destination),e.start(),e.stop(t.currentTime+.22)}catch{}}async executeCommand(t){if(this.isProcessingQuery)return;this.isProcessingQuery=!0,this.playAckChime();let e=t.toLowerCase().trim();this.responseText&&(this.responseText.innerText="Analyzing...");let a=!1;try{a=await this.processSequentialCommands(t)}catch(i){console.error("[Sequential Parser Error]",i)}if(a){this.isProcessingQuery=!1;return}if(e.includes("start timer")||e.includes("start focus")||e.includes("begin focus")||e.includes("resume timer")||e.includes("resume focus")){let o=this.clickButtonByKeywords(["start focus","begin focus","start timer","resume","start"])?"Certainly, I have started your study focus countdown timer session. Stay focused!":"Focus session timer has been activated.";this.speakReply(o);return}if(e.includes("stop timer")||e.includes("stop focus")||e.includes("pause timer")||e.includes("pause focus")||e.includes("freeze timer")){let o=this.clickButtonByKeywords(["stop focus","pause focus","pause timer","pause","stop"])?"Study timer has been paused. Breathe deeply and relax.":"Study countdown timer suspended.";this.speakReply(o);return}if(e.includes("reset timer")||e.includes("restart timer")||e.includes("reload timer")||e.includes("reset session")){let o=this.clickButtonByKeywords(["reset","restart","reload"])?"Acknowledged. Resetting your academic study session timer to default parameters.":"Focus session metrics reset to baseline.";this.speakReply(o);return}if(e.includes("scroll down")||e.includes("go down")){window.scrollBy({top:400,behavior:"smooth"}),this.speakReply("Scrolling down standard page viewport.");return}if(e.includes("scroll up")||e.includes("go up")){window.scrollBy({top:-400,behavior:"smooth"}),this.speakReply("Scrolling up study panel viewport.");return}if(e.includes("scroll to top")||e.includes("go to top")||e.includes("scroll top")){window.scrollTo({top:0,behavior:"smooth"}),this.speakReply("Navigated immediately to top dashboard layout section.");return}if(e.includes("scroll to bottom")||e.includes("go to bottom")||e.includes("scroll bottom")){window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"}),this.speakReply("Scrolling fully to bottom indicators panel layout block.");return}if(e.includes("open notification")||e.includes("click notification")||e.includes("notifications")||e.includes("alerts")){if(this.clickButtonByKeywords(["notification","bell","inbox","activities","alerts"]))this.speakReply("Perfect. Opening notification alert logs banner.");else{let o=document.getElementById("floating-notification-panel");o?(o.style.display=o.style.display==="none"?"block":"none",this.speakReply("Toggled alerts center overlay.")):this.speakReply("Alert dashboard grid section was not found.")}return}if(e.includes("preferences")||e.includes("open preferences")||e.includes("settings")||e.includes("customize")){this.clickButtonByKeywords(["preference","calibrate","cog","settings"])?this.speakReply("Activating custom preferences modal."):this.speakReply("Opening configuration limits dashboard layout.");return}if(e.includes("help")||e.includes("what can you do")||e.includes("capabilities")){this.speakReply("I can control your workspace panels. Ask me to start focus countdown, pause focus, reset session timer, scroll the layout, or open class alerts.");return}try{let i=localStorage.getItem("eduerror_current_user"),o=i?JSON.parse(i).firstName:"student",r=await fetch("/api/elyra",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:t,name:o})});if(r.ok){let n=await r.json();if(n&&n.reply){this.speakReply(n.reply);return}}this.speakReply(`I processed your query, but did not receive a chat response. How else can I help today, ${o}?`)}catch(i){console.warn("[Assistant UI] Server NLP API fallback error:",i);let o=localStorage.getItem("eduerror_current_user"),r=o?JSON.parse(o).firstName:"student";this.speakReply(`I accomplished your voice request offline, ${r}. Review connection details on your container registry to enable neural AI models.`)}}clickButtonByKeywords(t){let e=Array.from(document.querySelectorAll("button, [role='button'], a"));for(let a of e){let i=(a.textContent||"").toLowerCase(),o=(a.getAttribute("aria-label")||"").toLowerCase(),r=i+" "+o;for(let n of t)if(r.includes(n)){console.log("[Assistant Action] Auto Clicking:",a);let s=a.style.outline;return a.style.outline="2px solid #a855f7",setTimeout(()=>{a.style.outline=s},750),a.click(),!0}}return!1}speakReply(t){this.responseText&&(this.responseText.innerText=t),this.setVisualState("speaking"),this.isProcessingQuery=!1,this.stopSpeaking();let e=new SpeechSynthesisUtterance(t);e.volume=this.voiceVolume,e.rate=1.05;let i=window.speechSynthesis.getVoices().find(o=>o.name.includes("Google US English")||o.name.includes("Google")||o.lang.startsWith("en-US"));i&&(e.voice=i),e.onend=()=>this.onSpeechEndAndDisable(),e.onerror=()=>this.onSpeechEndAndDisable(),this.isSpeaking=!0,this.currentUtterance=e,window.speechSynthesis.speak(e)}onSpeechEndAndDisable(){this.isSpeaking=!1,this.currentUtterance=null,this.setVisualState("sleeping"),console.log("[Assistant] Command executed completely. Disabling active session microphone."),this.hudContainer&&(this.hideHUDTimer&&clearTimeout(this.hideHUDTimer),this.hideHUDTimer=setTimeout(()=>{this.status==="sleeping"&&this.hudContainer&&(this.hudContainer.classList.remove("opacity-100","scale-100","translate-y-0","elyra-hud-pulse"),this.hudContainer.classList.add("opacity-0","scale-90","translate-y-6","pointer-events-none"))},4500)),this.startRecognitionLoop()}stopSpeaking(){this.isSpeaking&&(window.speechSynthesis.cancel(),this.isSpeaking=!1,this.currentUtterance=null)}async processSequentialCommands(t){let e=t.toLowerCase().trim(),a=[],i=[];if((e.includes("question")||e.includes("set a paper")||e.includes("exam on")||e.includes("create an exam")||e.includes("set paper")||e.includes("set a question"))&&a.push("set_paper"),(e.includes("add a goal")||e.includes("add a weekly goal")||e.includes("create a goal")||e.includes("new weekly goal")||e.includes("add goal")||e.includes("add goal to manual"))&&a.push("add_goal"),(e.includes("upload syllabus")||e.includes("upload the syllabus")||e.includes("upload a syllabus")||e.includes("add syllabus")||e.includes("import syllabus"))&&a.push("upload_syllabus"),(e.includes("start timer")||e.includes("start focus")||e.includes("begin focus")||e.includes("resume timer")||e.includes("resume focus"))&&a.push("start_timer"),(e.includes("stop timer")||e.includes("stop focus")||e.includes("pause timer")||e.includes("pause focus"))&&a.push("stop_timer"),(e.includes("scroll down")||e.includes("go down"))&&a.push("scroll_down"),(e.includes("scroll up")||e.includes("go up"))&&a.push("scroll_up"),a.length===0)return!1;console.log("[Sequential Parser] Sequentially executing the following tasks:",a);for(let o of a)switch(o){case"set_paper":{let r="Physics";e.includes("chemistry")?r="Chemistry":e.includes("mathematics")||e.includes("higher math")||e.includes("math")?r="Higher Mathematics":e.includes("biology")?r="Biology":e.includes("ict")?r="ICT":e.includes("bangla")?r="Bangla":e.includes("english")?r="English":e.includes("science")&&(r="General Science");let n="Thermodynamics",s=e.match(/(?:on|about)\s+([a-zA-Z0-9\s]+)/i);s&&s[1]&&(n=s[1].trim()),n=n.replace(/with\s+\d+\s+questions/i,"").trim();let l=10,d=e.match(/(\d+)\s+question/);d&&d[1]&&(l=parseInt(d[1])),window.dispatchEvent(new CustomEvent("eduerror_set_question_papers",{detail:{subject:r,topic:n,count:l,type:e.includes("written")?"written":"mcq"}})),window.dispatchEvent(new CustomEvent("eduerror_set_active_tab",{detail:"exams"})),i.push(`Setting an exam on ${n}`);break}case"add_goal":{let r="";r=e.replace(/add\s+(?:a\s+)?(?:weekly\s+)?goal\s+(?:to\s+)?(?:the\s+)?(?:manual\s+)?(?:weekly\s+)?(?:goal\s+)?(?:to\s+)?/gi,"").trim().split(/and then|then|, and|and/)[0].trim(),(!r||r.length<2)&&(r="Review curriculum roadmap"),r=r.charAt(0).toUpperCase()+r.slice(1),window.dispatchEvent(new CustomEvent("eduerror_add_weekly_goal",{detail:r})),i.push(`adding a goal "${r}" to your weekly goals`);break}case"upload_syllabus":{window.dispatchEvent(new CustomEvent("eduerror_set_active_tab",{detail:"syllabus"})),setTimeout(()=>{let r=document.getElementById("additional-pdf-syll-upload");r&&r.click()},350),i.push("uploading your syllabus handout");break}case"start_timer":{this.clickButtonByKeywords(["start focus","begin focus","start timer","resume","start"]),i.push("starting your focus timer");break}case"stop_timer":{this.clickButtonByKeywords(["stop focus","pause focus","pause timer","pause","stop"]),i.push("pausing your study timer");break}case"scroll_down":{window.scrollBy({top:400,behavior:"smooth"}),i.push("scrolling down the screen");break}case"scroll_up":{window.scrollBy({top:-400,behavior:"smooth"}),i.push("scrolling up the screen");break}}if(i.length>0){let o=i.map((l,d)=>d===0?l.charAt(0).toUpperCase()+l.slice(1):d===i.length-1?`and ${l}`:l),r=localStorage.getItem("eduerror_current_user"),n=r?JSON.parse(r).firstName:"student",s=o.join(", ")+`. Ready to crush these tasks, ${n}!`;return this.speakReply(s),!0}return!1}checkForTutorInput(){let t=document.getElementById("eduerror-tutor-message-input");if(!t){this.isTutorVoiceActive&&this.stopTutorVoiceInput();return}if(document.getElementById("tutor-companion-container"))return;console.log("[Tutor Companion] Identified EduError Tutor text input. Injecting voice & camera companions...");let e=document.createElement("div");e.id="tutor-companion-container",e.className="flex items-center gap-1.5 shrink-0";let a=document.createElement("button");a.type="button",a.id="tutor-mic-btn",a.title="Speak to Type",a.className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-xl text-purple-400 hover:text-purple-300 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 h-9 w-9",a.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
      </svg>
    `,a.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),this.toggleTutorVoiceInput()});let i=document.createElement("button");i.type="button",i.id="tutor-cam-btn",i.title="Capture Camera Snapshot",i.className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 h-9 w-9",i.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
    `,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),this.openTutorCamera()}),e.appendChild(a),e.appendChild(i),t.addEventListener("input",r=>{r.isTrusted&&(this.tutorVoiceBaseText=t.value)});let o=t.closest("form");if(o){let r=o.querySelector('button[type="submit"]');r?o.insertBefore(e,r):o.appendChild(e),o.addEventListener("submit",()=>{this.isTutorVoiceActive&&(console.log("[Tutor Companion] Dictation terminated on form submit."),this.stopTutorVoiceInput())},!0);let n=document.getElementById("eduerror-tutor-send-button");n&&n.addEventListener("click",()=>{this.isTutorVoiceActive&&(console.log("[Tutor Companion] Dictation terminated on send button click."),setTimeout(()=>this.stopTutorVoiceInput(),50))}),t.addEventListener("keydown",s=>{s.key==="Enter"&&!s.shiftKey&&this.isTutorVoiceActive&&(console.log("[Tutor Companion] Dictation terminated on Enter key."),setTimeout(()=>this.stopTutorVoiceInput(),50))})}this.buildTutorWaveContainer(t)}toggleTutorVoiceInput(){this.isTutorVoiceActive?this.stopTutorVoiceInput():this.startTutorVoiceInput()}startTutorVoiceInput(){let t=window.SpeechRecognition||window.webkitSpeechRecognition;if(!t){alert("Speech Recognition API is not supported on this browser.");return}let e=document.getElementById("eduerror-tutor-message-input");if(!e)return;if(this.isTutorVoiceActive=!0,this.tutorVoiceBaseText=e.value||"",this.autoRestartMode=!1,this.isRecognitionActive&&this.recognition)try{this.recognition.stop()}catch{}let a=document.getElementById("tutor-mic-btn");a&&(a.classList.remove("bg-purple-500/10","text-purple-400","border-purple-500/20"),a.classList.add("bg-rose-500/20","text-rose-400","border-rose-500/40","animate-pulse")),this.tutorWaveContainer&&(this.tutorWaveContainer.classList.remove("opacity-0","scale-95","pointer-events-none"),this.tutorWaveContainer.classList.add("opacity-100","scale-100"));let i=new t;i.lang="en-US",i.interimResults=!0,i.continuous=!0,i.onresult=o=>{let r="",n="";for(let l=o.resultIndex;l<o.results.length;++l)o.results[l].isFinal?n+=o.results[l][0].transcript:r+=o.results[l][0].transcript;let s=n||r;if(s){let l=this.tutorVoiceBaseText?`${this.tutorVoiceBaseText.trim()} ${s.trim()}`:s.trim();this.setTutorInputValue(l)}},i.onend=()=>{if(this.isTutorVoiceActive)try{this.tutorVoiceRecognition.start()}catch{}},i.onerror=o=>{console.warn("[Tutor Voice] Dictation error:",o.error)},this.tutorVoiceRecognition=i;try{i.start()}catch(o){console.error("[Tutor Voice] Failed to start dictation recognition:",o)}}stopTutorVoiceInput(){if(this.isTutorVoiceActive=!1,this.tutorVoiceRecognition){try{this.tutorVoiceRecognition.onend=null,this.tutorVoiceRecognition.stop()}catch{}this.tutorVoiceRecognition=null}this.autoRestartMode=!0,this.startRecognitionLoop();let t=document.getElementById("tutor-mic-btn");t&&(t.classList.add("bg-purple-500/10","text-purple-400","border-purple-500/20"),t.classList.remove("bg-rose-500/20","text-rose-400","border-rose-500/40","animate-pulse")),this.tutorWaveContainer&&(this.tutorWaveContainer.classList.add("opacity-0","scale-95","pointer-events-none"),this.tutorWaveContainer.classList.remove("opacity-100","scale-100"))}setTutorInputValue(t){let e=document.getElementById("eduerror-tutor-message-input");if(!e)return;let a=e.value;e.value=t;let i=e._valueTracker;i&&i.setValue(a),e.dispatchEvent(new Event("input",{bubbles:!0}))}buildTutorWaveContainer(t){if(document.getElementById("tutor-wave-container"))return;let e=t.closest("form");if(!e)return;e.style.position="relative";let a=document.createElement("div");a.id="tutor-wave-container",a.className="absolute -top-12 left-4 px-3 py-1.5 bg-neutral-950/95 border border-purple-500/30 rounded-full flex items-center gap-2.5 shadow-2xl transition-all duration-300 transform opacity-0 scale-95 pointer-events-none z-50";let i=document.createElement("span");i.className="w-2 h-2 rounded-full bg-rose-500 animate-pulse",a.appendChild(i);let o=document.createElement("span");o.className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider",o.innerText="Listening...",a.appendChild(o);let r=document.createElement("div");r.className="flex items-end gap-0.5 h-3 px-1";let n=["bg-purple-400","bg-cyan-400","bg-indigo-450","bg-rose-450","bg-emerald-450"];for(let s=0;s<5;s++){let l=document.createElement("span");l.className=`w-[2px] rounded-full tutor-wave-bar ${n[s]}`,l.style.animationDuration=`${.4+s*.1}s`,r.appendChild(l)}a.appendChild(r),e.appendChild(a),this.tutorWaveContainer=a}openTutorCamera(){let t=document.getElementById("tutor-camera-modal");t||(t=document.createElement("div"),t.id="tutor-camera-modal",t.className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100000] flex items-center justify-center p-4 transition-all duration-300 opacity-0 pointer-events-none",t.innerHTML=`
        <div class="bg-slate-900 border border-cyan-500/20 max-w-md w-full rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] transform scale-95 transition-all duration-300">
          <div class="p-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h4 class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Active Camera Capture</h4>
              <p class="text-[10px] text-slate-400 font-sans mt-0.5">Snap and attach textbook problems or equations to Tutor</p>
            </div>
            <button id="close-camera-modal-btn" class="h-6 w-6 rounded-full border border-white/10 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer font-mono text-[11px] font-bold">\xD7</button>
          </div>
          <div class="p-4 flex flex-col items-center gap-3">
            <div class="relative w-full aspect-video bg-black rounded-xl border border-white/5 overflow-hidden">
              <video id="tutor-camera-video" autoplay playsinline class="w-full h-full object-cover"></video>
              <div id="camera-loading-overlay" class="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-[10px] font-mono gap-2">
                <div class="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                Initializing camera feed...
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-white/5 bg-slate-950/40 flex justify-between items-center gap-3">
            <button id="cancel-camera-btn" class="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-350 rounded-lg text-[10px] font-mono transition cursor-pointer">Cancel</button>
            <button id="snap-camera-btn" class="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-mono text-[10px] font-bold rounded-lg hover:brightness-110 transition shadow-lg shadow-cyan-400/20 cursor-pointer flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
              Capture & Attach
            </button>
          </div>
        </div>
      `,document.body.appendChild(t),document.getElementById("close-camera-modal-btn")?.addEventListener("click",()=>this.closeTutorCamera()),document.getElementById("cancel-camera-btn")?.addEventListener("click",()=>this.closeTutorCamera()),document.getElementById("snap-camera-btn")?.addEventListener("click",()=>this.captureCameraSnapshot())),t.classList.remove("pointer-events-none","opacity-0"),t.classList.add("opacity-100");let e=t.querySelector(".bg-slate-900");e&&(e.classList.remove("scale-95"),e.classList.add("scale-100"));let a=document.getElementById("tutor-camera-video"),i=document.getElementById("camera-loading-overlay");i&&(i.style.display="flex"),navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}}).then(o=>{this.cameraStream=o,a&&(a.srcObject=o,a.onloadedmetadata=()=>{i&&(i.style.display="none")})}).catch(o=>{console.error("[Camera Access Error] Failed to capture streams:",o),i&&(i.innerHTML=`
          <div class="text-rose-450 font-bold font-sans">\u26A0\uFE0F Access Error</div>
          <div class="text-[9px] text-slate-500 mt-1 max-w-[200px] text-center">Camera blocked. Please verify permissions in browser.</div>
        `)})}closeTutorCamera(){let t=document.getElementById("tutor-camera-modal");if(t){t.classList.add("pointer-events-none","opacity-0"),t.classList.remove("opacity-100");let e=t.querySelector(".bg-slate-900");e&&(e.classList.add("scale-95"),e.classList.remove("scale-100"))}this.cameraStream&&(this.cameraStream.getTracks().forEach(e=>{try{e.stop()}catch{}}),this.cameraStream=null)}captureCameraSnapshot(){let t=document.getElementById("tutor-camera-video");if(!t||!this.cameraStream)return;let e=document.createElement("canvas");e.width=t.videoWidth||640,e.height=t.videoHeight||480;let a=e.getContext("2d");a&&(a.drawImage(t,0,0,e.width,e.height),e.toBlob(i=>{if(!i)return;let o=new File([i],`camera-snapshot-${Date.now()}.png`,{type:"image/png"}),r=document.getElementById("file-diagram-upload");if(r){let n=new DataTransfer;n.items.add(o),r.files=n.files,r.dispatchEvent(new Event("change",{bubbles:!0})),console.log("[Camera Capture] Successfully loaded captured picture into Socratic Image Input!")}else alert("Socratic Image Upload structure is not fully parsed. Ensure you are on the Tutor tab.");this.closeTutorCamera()},"image/png"))}checkAuthStatus(){if(window.addEventListener("click",a=>{let i=a.target;i&&(i.textContent?.includes("Sign Out Session")||i.innerText?.includes("Sign Out Session")||i.closest("#sign-out-btn")||i.tagName==="BUTTON"&&i.textContent?.includes("Sign Out"))&&(console.log("[Auth] User clicked Sign Out Session button."),a.preventDefault(),a.stopPropagation(),this.handleLogout())}),localStorage.getItem("eduerror_logged_in")==="true"){console.log("[Auth] Active student profile located! Welcome back.");return}console.log("[Auth] No active session. Rendering beautiful credentials portal...");let e=document.createElement("style");e.id="auth-hide-root",e.textContent=`
      #root { display: none !important; }
      html, body { background: #050a14 !important; }
    `,document.head.appendChild(e),this.renderLoginOverlay()}renderLoginOverlay(){if(!document.getElementById("eduauth-fonts-link")){let u=document.createElement("link");u.id="eduauth-fonts-link",u.rel="stylesheet",u.href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap",document.head.appendChild(u)}let t="eduauth-component-styles";if(!document.getElementById(t)){let u=document.createElement("style");u.id=t,u.textContent=`
        #eduerror-login-overlay {
          --bg-dark: #050a14;
          --surface-dark: #0c1525;
          --card-dark: #101d35;
          --border-light: rgba(99,179,237,0.12);
          --accent-blue: #3b82f6;
          --accent-cyan: #06b6d4;
          --glow-blue: rgba(59,130,246,0.35);
          --text-light: #e8f0fe;
          --text-muted: #6b8cbe;
          --color-error: #f87171;
          --color-success: #34d399;

          position: fixed; inset: 0; z-index: 9999999;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg-dark);
          color: var(--text-light);
          overflow-y: auto;
          overflow-x: hidden;
        }

        #eduerror-login-overlay .eduauth-bg-scene {
          position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
        }
        #eduerror-login-overlay .eduauth-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }
        #eduerror-login-overlay .eduauth-orb {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35;
          animation: eduauth-drift 12s ease-in-out infinite alternate;
        }
        #eduerror-login-overlay .eduauth-orb-1 { width: 500px; height: 500px; background: #1d4ed8; top: -150px; left: -150px; }
        #eduerror-login-overlay .eduauth-orb-2 { width: 400px; height: 400px; background: #0891b2; bottom: -100px; right: -100px; animation-delay: -4s; }
        #eduerror-login-overlay .eduauth-orb-3 { width: 300px; height: 300px; background: #7c3aed; top: 40%; left: 60%; animation-delay: -8s; }

        @keyframes eduauth-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.08); }
        }

        #eduerror-login-overlay .eduauth-page {
          position: relative; z-index: 10; display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; width: 100vw;
        }

        #eduerror-login-overlay .eduauth-left-panel {
          display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 60px 70px; position: relative;
        }
        #eduerror-login-overlay .eduauth-brand {
          display: flex; align-items: center; gap: 14px; margin-bottom: 60px; animation: eduauth-fadeUp 0.8s ease both;
        }
        #eduerror-login-overlay .eduauth-brand-icon {
          width: 46px; height: 46px; background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
          border-radius: 12px; display: grid; place-items: center; font-size: 22px; box-shadow: 0 0 24px var(--glow-blue);
        }
        #eduerror-login-overlay .eduauth-brand-name {
          font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em;
        }
        #eduerror-login-overlay .eduauth-brand-name span { color: var(--accent-cyan); }

        #eduerror-login-overlay .eduauth-hero-tag {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent-cyan); background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.25);
          padding: 5px 14px; border-radius: 100px; margin-bottom: 28px; animation: eduauth-fadeUp 0.8s 0.1s ease both;
        }
        #eduerror-login-overlay .eduauth-hero-headline {
          font-family: 'Syne', sans-serif; font-size: clamp(2.2rem, 3.5vw, 3.2rem); font-weight: 800;
          line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 22px; animation: eduauth-fadeUp 0.8s 0.2s ease both;
        }
        #eduerror-login-overlay .eduauth-hero-headline .eduauth-highlight {
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        #eduerror-login-overlay .eduauth-hero-sub {
          font-size: 0.95rem; color: var(--text-muted); line-height: 1.7; max-width: 400px; margin-bottom: 50px;
          font-weight: 300; animation: eduauth-fadeUp 0.8s 0.3s ease both;
        }

        #eduerror-login-overlay .eduauth-features {
          display: flex; flex-direction: column; gap: 18px; animation: eduauth-fadeUp 0.8s 0.4s ease both;
        }
        #eduerror-login-overlay .eduauth-feature-item { display: flex; align-items: center; gap: 14px; }
        #eduerror-login-overlay .eduauth-feature-dot {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; display: grid; place-items: center; font-size: 16px;
        }
        #eduerror-login-overlay .eduauth-feature-dot.eduauth-blue   { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); }
        #eduerror-login-overlay .eduauth-feature-dot.eduauth-cyan   { background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); }
        #eduerror-login-overlay .eduauth-feature-dot.eduauth-purple { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); }
        #eduerror-login-overlay .eduauth-feature-text { font-size: 0.88rem; color: var(--text-muted); font-weight: 400; }
        #eduerror-login-overlay .eduauth-feature-text strong { color: var(--text-light); font-weight: 500; }

        #eduerror-login-overlay .eduauth-left-footer {
          position: absolute; bottom: 40px; left: 70px; font-size: 0.75rem; color: #3a5070; animation: eduauth-fadeUp 0.8s 0.6s ease both;
        }

        #eduerror-login-overlay .eduauth-right-panel {
          display: flex; align-items: center; justify-content: center; padding: 40px; perspective: 1200px; z-index: 20;
        }

        #eduerror-login-overlay .eduauth-flip-container {
          width: 100%; max-width: 440px; position: relative; transform-style: preserve-3d;
          transition: transform 0.85s cubic-bezier(0.68, -0.15, 0.32, 1.15);
        }
        #eduerror-login-overlay .eduauth-flip-container.eduauth-flipped {
          transform: rotateY(360deg);
        }

        #eduerror-login-overlay .eduauth-card {
          background: #09101f; border: 1px solid var(--border-light); border-radius: 24px; padding: 44px 44px 36px;
          position: relative; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset;
        }
        #eduerror-login-overlay .eduauth-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,179,237,0.4), transparent);
        }
        #eduerror-login-overlay .eduauth-card-shine {
          position: absolute; top: -60px; right: -60px; width: 180px; height: 180px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%); pointer-events: none;
        }

        #eduerror-login-overlay .eduauth-card-header { margin-bottom: 24px; }
        #eduerror-login-overlay .eduauth-card-title {
          font-family: 'Syne', sans-serif; font-size: 1.65rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 6px;
        }
        #eduerror-login-overlay .eduauth-card-subtitle { font-size: 0.85rem; color: var(--text-muted); font-weight: 300; }

        #eduerror-login-overlay .eduauth-tab-switcher {
          display: flex; background: rgba(255,255,255,0.03); border: 1px solid var(--border-light); border-radius: 12px; padding: 4px; margin-bottom: 24px; gap: 4px;
        }
        #eduerror-login-overlay .eduauth-tab-btn {
          flex: 1; padding: 10px; background: none; border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.25s ease;
        }
        #eduerror-login-overlay .eduauth-tab-btn.eduauth-active {
          background: linear-gradient(135deg, var(--accent-blue), #2563eb); color: #fff; box-shadow: 0 4px 16px rgba(59,130,246,0.35);
        }

        #eduerror-login-overlay .eduauth-form-section { display: none; animation: eduauth-slideIn 0.4s ease; }
        #eduerror-login-overlay .eduauth-form-section.eduauth-active { display: block; }
        @keyframes eduauth-slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        #eduerror-login-overlay .eduauth-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        #eduerror-login-overlay .eduauth-field { margin-bottom: 16px; }
        #eduerror-login-overlay .eduauth-field label {
          display: block; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;
        }
        #eduerror-login-overlay .eduauth-field-wrap { position: relative; }
        #eduerror-login-overlay .eduauth-field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 15px; opacity: 0.5; pointer-events: none;
        }
        #eduerror-login-overlay .eduauth-field input {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(99,179,237,0.15); border-radius: 11px;
          padding: 11px 14px 11px 40px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: var(--text-light); outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        #eduerror-login-overlay .eduauth-field input::placeholder { color: #3a5070; }
        #eduerror-login-overlay .eduauth-field input:focus {
          border-color: var(--accent-blue); background: rgba(59,130,246,0.05); box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        #eduerror-login-overlay .eduauth-field-extras { display: flex; justify-content: space-between; align-items: center; margin-top: -6px; margin-bottom: 20px; }
        #eduerror-login-overlay .eduauth-remember { display: flex; align-items: center; gap: 7px; font-size: 0.8rem; color: var(--text-muted); cursor: pointer; }
        #eduerror-login-overlay .eduauth-remember input[type=checkbox] { width: 14px; height: 14px; accent-color: var(--accent-blue); cursor: pointer; }
        #eduerror-login-overlay .eduauth-forgot { font-size: 0.8rem; color: var(--accent-cyan); text-decoration: none; }
        #eduerror-login-overlay .eduauth-forgot:hover { text-decoration: underline; text-underline-offset: 3px; }

        #eduerror-login-overlay .eduauth-password-criteria {
          display: flex; flex-direction: column; gap: 6px; margin-top: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px 12px; border-radius: 12px;
        }
        #eduerror-login-overlay .eduauth-criteria-item {
          display: flex; align-items: center; gap: 8px; font-size: 0.76rem; color: var(--text-muted); transition: all 0.25s ease;
        }
        #eduerror-login-overlay .eduauth-criteria-item.eduauth-completed {
          color: var(--color-success) !important;
        }
        #eduerror-login-overlay .eduauth-criteria-bullet {
          width: 6px; height: 6px; border-radius: 50%; background: #4a5d7c; transition: all 0.25s ease; flex-shrink: 0;
        }
        #eduerror-login-overlay .eduauth-criteria-item.eduauth-completed .eduauth-criteria-bullet {
          background: var(--color-success); box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
        }

        #eduerror-login-overlay .eduauth-terms { display: flex; align-items: flex-start; gap: 10px; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 18px; }
        #eduerror-login-overlay .eduauth-terms input[type=checkbox] { accent-color: var(--accent-blue); margin-top: 2px; }
        #eduerror-login-overlay .eduauth-terms a { color: var(--accent-cyan); text-decoration: none; }
        #eduerror-login-overlay .eduauth-terms a:hover { text-decoration: underline; text-underline-offset: 3px; }

        #eduerror-login-overlay .eduauth-btn-primary {
          width: 100%; padding: 13px; background: linear-gradient(135deg, var(--accent-blue) 0%, #2563eb 60%, var(--accent-cyan) 100%);
          background-size: 200% 200%; border: none; border-radius: 12px; font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 600;
          letter-spacing: 0.01em; color: #fff; cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, background-position 0.4s;
          box-shadow: 0 6px 24px rgba(59,130,246,0.35); animation: eduauth-gradShift 4s ease infinite alternate;
        }
        #eduerror-login-overlay .eduauth-btn-primary::after {
          content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent); border-radius: inherit;
        }
        #eduerror-login-overlay .eduauth-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(59,130,246,0.5); }
        #eduerror-login-overlay .eduauth-btn-primary:active { transform: translateY(0); }
        #eduerror-login-overlay .eduauth-btn-primary.eduauth-loading .eduauth-btn-text { opacity: 0; }
        #eduerror-login-overlay .eduauth-btn-primary.eduauth-loading .eduauth-btn-spinner { display: block; }
        #eduerror-login-overlay .eduauth-btn-spinner {
          display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: eduauth-spin 0.7s linear infinite;
        }
        @keyframes eduauth-spin { to { transform: translate(-50%,-50%) rotate(360deg); } }

        #eduerror-login-overlay .eduauth-divider {
          display: flex; align-items: center; gap: 12px; margin: 20px 0; font-size: 0.75rem; color: #2d4060;
        }
        #eduerror-login-overlay .eduauth-divider::before, #eduerror-login-overlay .eduauth-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(99,179,237,0.1);
        }

        #eduerror-login-overlay .eduauth-socials { display: flex; gap: 10px; }
        #eduerror-login-overlay .eduauth-btn-social {
          flex: 1; padding: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-light); border-radius: 11px;
          display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        #eduerror-login-overlay .eduauth-btn-social:hover { background: rgba(255,255,255,0.07); border-color: rgba(99,179,237,0.25); color: var(--text-light); }
        #eduerror-login-overlay .eduauth-btn-social svg { width: 17px; height: 17px; }

        #eduerror-login-overlay .eduauth-switch-text {
          text-align: center; font-size: 0.82rem; color: var(--text-muted); margin-top: 20px;
        }
        #eduerror-login-overlay .eduauth-switch-text button {
          background: none; border: none; color: var(--accent-cyan); font-family: 'DM Sans', sans-serif;
          font-size: inherit; font-weight: 500; cursor: pointer; text-decoration: underline; text-underline-offset: 3px;
        }

        #eduerror-login-overlay .eduauth-particles { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        #eduerror-login-overlay .eduauth-particle {
          position: absolute; width: 2px; height: 2px; background: var(--accent-blue); border-radius: 50%; opacity: 0;
          animation: eduauth-particleFloat linear infinite;
        }

        @keyframes eduauth-particleFloat {
          0%   { opacity: 0; transform: translateY(0) scale(0); }
          10%  { opacity: 0.6; transform: scale(1); }
          90%  { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(-100vh) scale(0.5); }
        }

        @keyframes eduauth-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          #eduerror-login-overlay .eduauth-page { grid-template-columns: 1fr; overflow-y: auto; }
          #eduerror-login-overlay .eduauth-left-panel { display: none; }
          #eduerror-login-overlay .eduauth-right-panel { padding: 24px; min-height: 100vh; }
        }

        #eduerror-login-overlay #eduauth-toast {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(80px);
          background: #09101f; border: 1px solid rgba(52,211,153,0.3); border-radius: 12px;
          padding: 12px 22px; font-size: 0.85rem; color: var(--color-success);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5); transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 9999999999; white-space: nowrap; pointer-events: none;
        }
        #eduerror-login-overlay #eduauth-toast.eduauth-show { transform: translateX(-50%) translateY(0); }

        #eduerror-login-overlay .eduauth-brand-icon svg {
          animation: eduauth-rotateRing 8s linear infinite;
        }
        @keyframes eduauth-rotateRing {
          to { transform: rotate(360deg); }
        }

        #eduerror-login-overlay .eduauth-sso-modal-overlay {
          position: fixed; inset: 0; background: rgba(5, 10, 20, 0.88);
          backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center;
          z-index: 100000000; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #eduerror-login-overlay .eduauth-sso-modal-overlay.eduauth-show {
          opacity: 1; pointer-events: auto;
        }
        #eduerror-login-overlay .eduauth-sso-card {
          width: 90%; max-width: 400px; background: #0c1525; border: 1px solid rgba(99,179,237,0.22);
          border-radius: 20px; padding: 34px; box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.02) inset;
          transform: translateY(15px); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #eduerror-login-overlay .eduauth-sso-modal-overlay.eduauth-show .eduauth-sso-card {
          transform: translateY(0);
        }
        #eduerror-login-overlay .eduauth-sso-brand-header {
          display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
        }
        #eduerror-login-overlay .eduauth-sso-provider-name {
          font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 700; color: #fff;
        }
        #eduerror-login-overlay .eduauth-sso-sub {
          font-size: 0.82rem; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5; font-weight: 300;
        }
        #eduerror-login-overlay .eduauth-sso-error-alert {
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); color: var(--color-error);
          font-size: 0.8rem; padding: 10px 14px; border-radius: 10px; margin-bottom: 18px; line-height: 1.4;
        }
        #eduerror-login-overlay .eduauth-sso-actions {
          display: flex; gap: 12px; margin-top: 24px;
        }
        #eduerror-login-overlay .eduauth-sso-btn-cancel {
          flex: 1; padding: 11px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-light);
          border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        #eduerror-login-overlay .eduauth-sso-btn-cancel:hover {
          background: rgba(255,255,255,0.08); color: var(--text-light);
        }
        #eduerror-login-overlay .eduauth-sso-btn-submit {
          flex: 1.5; padding: 11px; background: linear-gradient(135deg, var(--accent-blue), #2563eb);
          border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 600;
          color: #fff; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(59,130,246,0.3);
        }
        #eduerror-login-overlay .eduauth-sso-btn-submit:hover {
          transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.45);
        }
        #eduerror-login-overlay .eduauth-sso-btn-submit:active {
          transform: translateY(0);
        }
      `,document.head.appendChild(u)}let e=document.createElement("div");e.id="eduerror-login-overlay",localStorage.getItem("eduerror_accounts")||localStorage.setItem("eduerror_accounts",JSON.stringify([])),e.innerHTML=`
      <div class="eduauth-bg-scene">
        <div class="eduauth-bg-grid"></div>
        <div class="eduauth-orb eduauth-orb-1"></div>
        <div class="eduauth-orb eduauth-orb-2"></div>
        <div class="eduauth-orb eduauth-orb-3"></div>
      </div>
      <div class="eduauth-particles" id="eduauth-particles"></div>
      <div id="eduauth-toast">Account created! Welcome to EduError.</div>

      <div class="eduauth-page">
        <!-- LEFT BRAND PANEL -->
        <div class="eduauth-left-panel">
          <div class="eduauth-brand">
            <div class="eduauth-brand-icon">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="10" stroke="white" stroke-width="1.5" stroke-dasharray="4 2"/>
                <circle cx="13" cy="13" r="5" fill="white" opacity="0.9"/>
                <circle cx="13" cy="5" r="2.5" fill="white"/>
              </svg>
            </div>
            <div class="eduauth-brand-name">Edu<span>Error</span></div>
          </div>

          <div class="eduauth-hero-tag">AI-Powered Personalized Learning</div>

          <h1 class="eduauth-hero-headline">
            Learn smarter,<br>
            not <span class="eduauth-highlight">harder.</span>
          </h1>

          <p class="eduauth-hero-sub">
            EduError adapts to every learner's unique pattern \u2014 identifying gaps, reinforcing strengths, and building a custom path to mastery.
          </p>

          <div class="eduauth-features">
            <div class="eduauth-feature-item">
              <div class="eduauth-feature-dot eduauth-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z"/></svg>
              </div>
              <div class="eduauth-feature-text"><strong>Adaptive AI Engine</strong> \u2014 learns how you learn, then optimizes every session</div>
            </div>
            <div class="eduauth-feature-item">
              <div class="eduauth-feature-dot eduauth-cyan">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div class="eduauth-feature-text"><strong>Real-time Feedback</strong> \u2014 instant analysis of errors with root-cause explanations</div>
            </div>
            <div class="eduauth-feature-item">
              <div class="eduauth-feature-dot eduauth-purple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <div class="eduauth-feature-text"><strong>Progress Intelligence</strong> \u2014 predictive insights on mastery timelines</div>
            </div>
          </div>

          <div class="eduauth-left-footer">\xA9 2026 EduError Inc. \u2014 Transforming Education with AI</div>
        </div>

        <!-- RIGHT CREDENTIALS CONTAINER -->
        <div class="eduauth-right-panel">
          <div class="eduauth-flip-container" id="eduauth-flip-card">
            <div class="eduauth-card">
              <div class="eduauth-card-shine"></div>

              <!-- SWITCH TABS LINK -->
              <div class="eduauth-tab-switcher">
                <button class="eduauth-tab-btn eduauth-active" id="eduauth-tab-login">Sign In</button>
                <button class="eduauth-tab-btn" id="eduauth-tab-signup">Sign Up</button>
              </div>

              <!-- SECTION SIGN IN -->
              <div class="eduauth-form-section eduauth-active" id="eduauth-section-login">
                <div class="eduauth-card-header">
                  <div class="eduauth-card-title">Welcome back</div>
                  <div class="eduauth-card-subtitle">Continue your learning journey</div>
                </div>

                <div class="eduauth-field">
                  <label>Email address</label>
                  <div class="eduauth-field-wrap">
                    <span class="eduauth-field-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </span>
                    <input type="email" id="eduauth-login-email" placeholder="you@example.com" value="" autocomplete="email">
                  </div>
                </div>

                <div class="eduauth-field">
                  <label>Password</label>
                  <div class="eduauth-field-wrap">
                    <span class="eduauth-field-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input type="password" id="eduauth-login-password" placeholder="Enter your password" value="" autocomplete="current-password">
                  </div>
                </div>

                <div class="eduauth-field-extras">
                  <label class="eduauth-remember">
                    <input type="checkbox" id="eduauth-remember-check" checked> Remember me
                  </label>
                  <a href="#" class="eduauth-forgot" onclick="event.preventDefault(); alert('Please create an account using the Sign Up tab first.');">Forgot password?</a>
                </div>

                <button class="eduauth-btn-primary" id="eduauth-login-submit">
                  <span class="eduauth-btn-text">Sign In to EduError</span>
                  <div class="eduauth-btn-spinner"></div>
                </button>

                <div class="eduauth-divider">or continue with</div>
                <div class="eduauth-socials">
                  <button class="eduauth-btn-social" id="eduauth-google-login">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>
                  <button class="eduauth-btn-social" id="eduauth-linkedin-login">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/></svg>
                    LinkedIn
                  </button>
                  <button class="eduauth-btn-social" id="eduauth-github-login">
                    <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    GitHub
                  </button>
                </div>

                <div class="eduauth-switch-text">
                  Don't have an account? <button id="eduauth-switch-to-signup">Create one free</button>
                </div>
              </div>

              <!-- SECTION SIGN UP -->
              <div class="eduauth-form-section" id="eduauth-section-signup">
                <div class="eduauth-card-header">
                  <div class="eduauth-card-title">Start learning</div>
                  <div class="eduauth-card-subtitle">Create your free EduError account</div>
                </div>

                <div class="eduauth-form-row">
                  <div class="eduauth-field">
                    <label>First name</label>
                    <div class="eduauth-field-wrap">
                      <span class="eduauth-field-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      <input type="text" id="eduauth-signup-firstname" placeholder="John" autocomplete="given-name">
                    </div>
                  </div>
                  <div class="eduauth-field">
                    <label>Last name</label>
                    <div class="eduauth-field-wrap">
                      <span class="eduauth-field-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      <input type="text" id="eduauth-signup-lastname" placeholder="Chen" autocomplete="family-name">
                    </div>
                  </div>
                </div>

                <div class="eduauth-field">
                  <label>Email address</label>
                  <div class="eduauth-field-wrap">
                    <span class="eduauth-field-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </span>
                    <input type="email" id="eduauth-signup-email" placeholder="you@example.com" autocomplete="email">
                  </div>
                </div>

                <div class="eduauth-field">
                  <label>Password</label>
                  <div class="eduauth-field-wrap">
                    <span class="eduauth-field-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input type="password" id="eduauth-signup-password" placeholder="Create a strong password">
                  </div>
                  <div class="eduauth-password-criteria" id="eduauth-password-criteria">
                    <div class="eduauth-criteria-item" id="crit-length">
                      <span class="eduauth-criteria-bullet"></span> A minimum length of 8 characters.
                    </div>
                    <div class="eduauth-criteria-item" id="crit-number">
                      <span class="eduauth-criteria-bullet"></span> At least one number (0-9).
                    </div>
                    <div class="eduauth-criteria-item" id="crit-upper">
                      <span class="eduauth-criteria-bullet"></span> At least one uppercase letter (A-Z).
                    </div>
                    <div class="eduauth-criteria-item" id="crit-lower">
                      <span class="eduauth-criteria-bullet"></span> At least one lowercase letter (a-z).
                    </div>
                    <div class="eduauth-criteria-item" id="crit-special">
                      <span class="eduauth-criteria-bullet"></span> At least one special character (@, #, &, $).
                    </div>
                  </div>
                </div>

                <div class="eduauth-terms">
                  <input type="checkbox" id="eduauth-terms-check">
                  <label for="eduauth-terms-check">I agree to the <a href="#" onclick="event.preventDefault(); alert('EduError Study System Policy is locally active.');">Terms of Service</a> and <a href="#" onclick="event.preventDefault();">Privacy Policy</a></label>
                </div>

                <button class="eduauth-btn-primary" id="eduauth-signup-submit">
                  <span class="eduauth-btn-text">Create Free Account</span>
                  <div class="eduauth-btn-spinner"></div>
                </button>

                <div class="eduauth-divider">or sign up with</div>
                <div class="eduauth-socials">
                  <button class="eduauth-btn-social" id="eduauth-google-signup">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>
                  <button class="eduauth-btn-social" id="eduauth-linkedin-signup">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/></svg>
                    LinkedIn
                  </button>
                  <button class="eduauth-btn-social" id="eduauth-github-signup">
                    <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    GitHub
                  </button>
                </div>

                <div class="eduauth-switch-text">
                  Already have an account? <button id="eduauth-switch-to-login">Sign in</button>
                </div>
              </div>

            </div><!-- /card -->
          </div><!-- /flip-container -->
        </div>
      </div>

      <!-- SSO MODAL CENTERED DIALOG -->
      <div id="eduauth-sso-modal" class="eduauth-sso-modal-overlay">
        <div class="eduauth-sso-card">
          <div class="eduauth-sso-brand-header">
            <span id="eduauth-sso-logo-slot"></span>
            <span class="eduauth-sso-provider-name" id="eduauth-sso-provider-title">Continue with Partner</span>
          </div>
          <div class="eduauth-sso-sub">
            Link and authorize your genuine account to proceed. Start with zero telemetry configuration.
          </div>
          <div id="eduauth-sso-alert" class="eduauth-sso-error-alert" style="display: none;"></div>
          
          <div class="eduauth-field">
            <label for="eduauth-sso-fullname">Full Name (First & Last)</label>
            <div class="eduauth-field-wrap">
              <span class="eduauth-field-icon">\u{1F464}</span>
              <input type="text" id="eduauth-sso-fullname" placeholder="e.g. Jane Smith">
            </div>
          </div>
          
          <div class="eduauth-field">
            <label for="eduauth-sso-email">Account Email</label>
            <div class="eduauth-field-wrap">
              <span class="eduauth-field-icon">\u2709\uFE0F</span>
              <input type="email" id="eduauth-sso-email" placeholder="e.g. janesmith@gmail.com">
            </div>
          </div>
          
          <div class="eduauth-sso-actions">
            <button class="eduauth-sso-btn-cancel" id="eduauth-sso-cancel">Cancel</button>
            <button class="eduauth-sso-btn-submit" id="eduauth-sso-submit">Authorize Session</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(e),this.authContainer=e;let a=document.getElementById("eduauth-particles");if(a)for(let u=0;u<30;u++){let x=document.createElement("div");x.className="eduauth-particle",x.style.cssText=`
          left: ${Math.random()*100}%;
          top: ${Math.random()*100}%;
          animation-duration: ${6+Math.random()*10}s;
          animation-delay: ${Math.random()*10}s;
          opacity: ${.25+Math.random()*.45};
          width: ${1+Math.random()*2}px;
          height: ${1+Math.random()*2}px;
          background: ${Math.random()>.5?"#3b82f6":"#06b6d4"};
        `,a.appendChild(x)}let i=document.getElementById("eduauth-tab-login"),o=document.getElementById("eduauth-tab-signup"),r=document.getElementById("eduauth-switch-to-login"),n=document.getElementById("eduauth-switch-to-signup");i&&i.addEventListener("click",()=>this.switchAuthTab("login")),o&&o.addEventListener("click",()=>this.switchAuthTab("signup")),r&&r.addEventListener("click",()=>this.switchAuthTab("login")),n&&n.addEventListener("click",()=>this.switchAuthTab("signup"));let s=document.getElementById("eduauth-signup-password");s&&s.addEventListener("input",u=>{this.checkPasswordStrength(u.target.value)});let l=document.getElementById("eduauth-login-password");l&&l.addEventListener("keydown",u=>{u.key==="Enter"&&(u.preventDefault(),this.handleLogin(document.getElementById("eduauth-login-submit")))}),s&&s.addEventListener("keydown",u=>{u.key==="Enter"&&(u.preventDefault(),this.handleSignup(document.getElementById("eduauth-signup-submit")))});let d=document.getElementById("eduauth-login-submit");d&&d.addEventListener("click",u=>{u.preventDefault(),this.handleLogin(d)});let m=document.getElementById("eduauth-signup-submit");m&&m.addEventListener("click",u=>{u.preventDefault(),this.handleSignup(m)});let y=document.getElementById("eduauth-google-login"),p=document.getElementById("eduauth-google-signup"),g=document.getElementById("eduauth-linkedin-login"),v=document.getElementById("eduauth-linkedin-signup"),c=document.getElementById("eduauth-github-login"),f=document.getElementById("eduauth-github-signup");y&&y.addEventListener("click",()=>this.handleSocialLogin("Google",y)),p&&p.addEventListener("click",()=>this.handleSocialLogin("Google",p)),g&&g.addEventListener("click",()=>this.handleSocialLogin("LinkedIn",g)),v&&v.addEventListener("click",()=>this.handleSocialLogin("LinkedIn",v)),c&&c.addEventListener("click",()=>this.handleSocialLogin("GitHub",c)),f&&f.addEventListener("click",()=>this.handleSocialLogin("GitHub",f));let h=document.getElementById("eduauth-sso-cancel");h&&h.addEventListener("click",u=>{u.preventDefault(),this.closeSsoModal()});let b=document.getElementById("eduauth-sso-submit");b&&b.addEventListener("click",u=>{u.preventDefault(),this.handleSsoSubmit()})}switchAuthTab(t){if(t===this.currentAuthTab)return;let e=document.getElementById("eduauth-flip-card"),a=document.getElementById("eduauth-tab-login"),i=document.getElementById("eduauth-tab-signup"),o=document.getElementById("eduauth-section-login"),r=document.getElementById("eduauth-section-signup");!e||!a||!i||!o||!r||(e.classList.add("eduauth-flipped"),setTimeout(()=>{o.classList.remove("eduauth-active"),r.classList.remove("eduauth-active"),t==="login"?(o.classList.add("eduauth-active"),a.classList.add("eduauth-active"),i.classList.remove("eduauth-active")):(r.classList.add("eduauth-active"),i.classList.add("eduauth-active"),a.classList.remove("eduauth-active")),this.currentAuthTab=t},425),setTimeout(()=>{e.style.transition="none",e.classList.remove("eduauth-flipped"),e.offsetWidth,e.style.transition=""},870))}checkPasswordStrength(t){let e=document.getElementById("crit-length"),a=document.getElementById("crit-number"),i=document.getElementById("crit-upper"),o=document.getElementById("crit-lower"),r=document.getElementById("crit-special");e&&(t.length>=8?e.classList.add("eduauth-completed"):e.classList.remove("eduauth-completed")),a&&(/[0-9]/.test(t)?a.classList.add("eduauth-completed"):a.classList.remove("eduauth-completed")),i&&(/[A-Z]/.test(t)?i.classList.add("eduauth-completed"):i.classList.remove("eduauth-completed")),o&&(/[a-z]/.test(t)?o.classList.add("eduauth-completed"):o.classList.remove("eduauth-completed")),r&&(/[@#&\$]/.test(t)?r.classList.add("eduauth-completed"):r.classList.remove("eduauth-completed"))}handleLogin(t){let e=document.getElementById("eduauth-login-email"),a=document.getElementById("eduauth-login-password");if(!e||!a)return;let i=e.value.trim(),o=a.value;let banner=document.getElementById("eduauth-login-error-banner");if(!banner){banner=document.createElement("div");banner.id="eduauth-login-error-banner";banner.style.cssText="color:#f87171;padding:10px 14px;border:1px solid rgba(248,113,113,0.25);background:rgba(248,113,113,0.1);border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:500;font-family:sans-serif;";let header=document.querySelector("#eduauth-section-login .eduauth-card-header");if(header)header.insertAdjacentElement("afterend",banner)}banner.style.display="none";let clearHighs=()=>{[e,a].forEach(inp=>{if(inp){let wrap=inp.closest(".eduauth-field-wrap")||inp;wrap.style.removeProperty("border-color")}});banner.style.display="none"};clearHighs();if(!i&&!o){banner.textContent="Error: Both Email and Password fields are empty. Please fill them in.";banner.style.display="block";[e,a].forEach(inp=>{let wrap=inp.closest(".eduauth-field-wrap")||inp;wrap.style.setProperty("border-color","#f87171","important");inp.addEventListener("input",clearHighs)});return}if(!i){banner.textContent="Error: Email field is empty. Please enter your email.";banner.style.display="block";let wrap=e.closest(".eduauth-field-wrap")||e;wrap.style.setProperty("border-color","#f87171","important");e.addEventListener("input",clearHighs);return}if(!o){banner.textContent="Error: Password field is empty. Please enter your password.";banner.style.display="block";let wrap=a.closest(".eduauth-field-wrap")||a;wrap.style.setProperty("border-color","#f87171","important");a.addEventListener("input",clearHighs);return}if(!i.includes("@")){banner.textContent="Error: Email address is invalid because it is missing the '@' symbol. Please enter a valid email address.";banner.style.display="block";let wrap=e.closest(".eduauth-field-wrap")||e;wrap.style.setProperty("border-color","#f87171","important");e.addEventListener("input",clearHighs);return}t.classList.add("eduauth-loading"),setTimeout(()=>{t.classList.remove("eduauth-loading");let r=localStorage.getItem("eduerror_accounts")||"[]",s=JSON.parse(r).find(l=>l.email.toLowerCase()===i.toLowerCase()&&l.password===o);s?this.completeSuccessfulAuth({firstName:s.firstName,lastName:s.lastName||"",email:s.email}):(banner.textContent="Error: Invalid email or password combination. Please sign up to create an account first.",banner.style.display="block")},1200)}handleSignup(t){let e=document.getElementById("eduauth-signup-firstname"),a=document.getElementById("eduauth-signup-lastname"),i=document.getElementById("eduauth-signup-email"),o=document.getElementById("eduauth-signup-password"),r=document.getElementById("eduauth-terms-check");if(!e||!a||!i||!o)return;let n=e.value.trim(),s=a.value.trim(),l=i.value.trim(),d=o.value;let banner=document.getElementById("eduauth-signup-error-banner");if(!banner){banner=document.createElement("div");banner.id="eduauth-signup-error-banner";banner.style.cssText="color:#f87171;padding:10px 14px;border:1px solid rgba(248,113,113,0.25);background:rgba(248,113,113,0.1);border-radius:12px;margin-bottom:16px;font-size:13px;font-weight:500;font-family:sans-serif;";let header=document.querySelector("#eduauth-section-signup .eduauth-card-header");if(header)header.insertAdjacentElement("afterend",banner)}banner.style.display="none";let clearHighs=()=>{[e,a,i,o].forEach(inp=>{if(inp){let wrap=inp.closest(".eduauth-field-wrap")||inp;wrap.style.removeProperty("border-color")}});banner.style.display="none"};clearHighs();if(!n){banner.textContent="Error: The First name field is empty. Please enter your first name.";banner.style.display="block";let wrap=e.closest(".eduauth-field-wrap")||e;wrap.style.setProperty("border-color","#f87171","important");e.addEventListener("input",clearHighs);return}if(!s){banner.textContent="Error: The Last name field is empty. Please enter your last name.";banner.style.display="block";let wrap=a.closest(".eduauth-field-wrap")||a;wrap.style.setProperty("border-color","#f87171","important");a.addEventListener("input",clearHighs);return}if(!l){banner.textContent="Error: The Email address field is empty. Please enter your email.";banner.style.display="block";let wrap=i.closest(".eduauth-field-wrap")||i;wrap.style.setProperty("border-color","#f87171","important");i.addEventListener("input",clearHighs);return}if(!d){banner.textContent="Error: The Password field is empty. Please enter a password.";banner.style.display="block";let wrap=o.closest(".eduauth-field-wrap")||o;wrap.style.setProperty("border-color","#f87171","important");o.addEventListener("input",clearHighs);return}if(!l.includes("@")){banner.textContent="Error: Email address is invalid because it is missing the '@' symbol. Please enter a valid email address.";banner.style.display="block";let wrap=i.closest(".eduauth-field-wrap")||i;wrap.style.setProperty("border-color","#f87171","important");i.addEventListener("input",clearHighs);return}let m=d.length>=8,y=/[0-9]/.test(d),p=/[A-Z]/.test(d),g=/[a-z]/.test(d),v=/[@#&\$]/.test(d);if(!m||!y||!p||!g||!v){banner.textContent="Error: Password must be a minimum of 8 characters, including a number, Upper case letter, lower case letter, and special character (@, #, &, $).";banner.style.display="block";let wrap=o.closest(".eduauth-field-wrap")||o;wrap.style.setProperty("border-color","#f87171","important");o.addEventListener("input",clearHighs);return}if(!r||!r.checked){banner.textContent="Error: To create an account, you must tick 'I agree to the Terms of Service'.";banner.style.display="block";return}t.classList.add("eduauth-loading"),setTimeout(()=>{t.classList.remove("eduauth-loading");let c=localStorage.getItem("eduerror_accounts")||"[]",f=JSON.parse(c);if(f.some(k=>k.email.toLowerCase()===l.toLowerCase())){alert("An account with this email address already exists. Please choose another.");return}f.push({email:l,password:d,firstName:n,lastName:s}),localStorage.setItem("eduerror_accounts",JSON.stringify(f));let b=document.getElementById("eduauth-toast");b&&(b.textContent="Account created successfully! Please Sign In below.",b.classList.add("eduauth-show"),setTimeout(()=>b.classList.remove("eduauth-show"),3e3)),e.value="",a.value="",i.value="",o.value="",r&&(r.checked=!1);let u=document.getElementById("eduauth-login-email"),x=document.getElementById("eduauth-login-password");u&&(u.value=l),x&&(x.value=d),this.switchAuthTab("login")},1500)}showSsoModal(t,e){this.currentSsoProvider=t,this.currentSsoButton=e;let a=document.getElementById("eduauth-sso-modal"),i=document.getElementById("eduauth-sso-provider-title"),o=document.getElementById("eduauth-sso-logo-slot"),r=document.getElementById("eduauth-sso-alert"),n=document.getElementById("eduauth-sso-fullname"),s=document.getElementById("eduauth-sso-email");if(!a||!i||!o||!n||!s)return;n.value="",s.value="",r&&(r.textContent="",r.style.display="none"),i.textContent=`Continue with ${t}`;let l="";t==="Google"?(l='<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>',a.style.setProperty("--accent-blue","#4285F4")):t==="LinkedIn"?(l='<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/></svg>',a.style.setProperty("--accent-blue","#0A66C2")):t==="GitHub"&&(l='<svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',a.style.setProperty("--accent-blue","#24292e")),o.innerHTML=l,a.classList.add("eduauth-show")}closeSsoModal(){let t=document.getElementById("eduauth-sso-modal");t&&t.classList.remove("eduauth-show"),this.currentSsoProvider=null,this.currentSsoButton=null}handleSsoSubmit(){let t=document.getElementById("eduauth-sso-fullname"),e=document.getElementById("eduauth-sso-email"),a=document.getElementById("eduauth-sso-alert");if(!t||!e)return;let i=t.value.trim(),o=e.value.trim();if(!i||!o){a&&(a.textContent="Please fill in all requested fields.",a.style.display="block");return}if(!o.includes("@")){a&&(a.textContent="The account email is invalid because it is missing the '@' symbol. Please include an '@' symbol.",a.style.display="block");return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o)){a&&(a.textContent="Please enter a valid email address.",a.style.display="block");return}let n=i.split(" "),s=n[0],l=n.slice(1).join(" ")||"",d=this.currentSsoProvider||"Google",m=document.getElementById("eduauth-sso-submit");m&&(m.textContent="Connecting Profile...",m.disabled=!0),setTimeout(()=>{m&&(m.textContent="Authorize Session",m.disabled=!1);let y=localStorage.getItem("eduerror_accounts")||"[]",p=JSON.parse(y),g=p.findIndex(c=>c.email.toLowerCase()===o.toLowerCase()),v=o.toLowerCase();if(this.currentAuthTab==="signup"){if(g!==-1){let h=p[g];h.isSocial&&h.provider===d?(this.closeSsoModal(),this.completeSuccessfulAuth({firstName:h.firstName,lastName:h.lastName,email:h.email})):a&&(a.textContent="An account with this email address already exists. Please sign in below.",a.style.display="block");return}let c={email:o,firstName:s,lastName:l,isSocial:!0,provider:d};p.push(c),localStorage.setItem("eduerror_accounts",JSON.stringify(p)),localStorage.removeItem(`user_${v}_eduerror_student_twin_v3`),this.clearGlobalTelemetry(),["eduerror_progress_v2","eduerror_screentime_seconds","eduerror_adhd_boost","eduerror_exam_attempts_history","eduerror_weekly_goals_manual","eduerror_mentor_sessions","eduerror_active_sess_id","eduerror_active_classroom","eduerror_student_enrolled_state","eduerror_last_chatted_topic","eduerror_last_read_topic","eduerror_last_active_date_v3","eduerror_last_active_date"].forEach(h=>localStorage.removeItem(`user_${v}_${h}`)),this.closeSsoModal(),this.completeSuccessfulAuth({firstName:s,lastName:l,email:o})}else if(g!==-1){let c=p[g];this.closeSsoModal(),this.completeSuccessfulAuth({firstName:c.firstName,lastName:c.lastName||"",email:c.email})}else{let c={email:o,firstName:s,lastName:l,isSocial:!0,provider:d};p.push(c),localStorage.setItem("eduerror_accounts",JSON.stringify(p)),localStorage.removeItem(`user_${v}_eduerror_student_twin_v3`),this.clearGlobalTelemetry(),["eduerror_progress_v2","eduerror_screentime_seconds","eduerror_adhd_boost","eduerror_exam_attempts_history","eduerror_weekly_goals_manual","eduerror_mentor_sessions","eduerror_active_sess_id","eduerror_active_classroom","eduerror_student_enrolled_state","eduerror_last_chatted_topic","eduerror_last_read_topic","eduerror_last_active_date_v3","eduerror_last_active_date"].forEach(h=>localStorage.removeItem(`user_${v}_${h}`)),this.closeSsoModal(),this.completeSuccessfulAuth({firstName:s,lastName:l,email:o})}},1200)}backupUserData(t){if(!t)return;["eduerror_student_twin_v3","eduerror_progress_v2","eduerror_screentime_seconds","eduerror_adhd_boost","eduerror_exam_attempts_history","eduerror_weekly_goals_manual","eduerror_mentor_sessions","eduerror_active_sess_id","eduerror_active_classroom","eduerror_student_enrolled_state","eduerror_last_chatted_topic","eduerror_last_read_topic","eduerror_last_active_date_v3","eduerror_last_active_date"].forEach(a=>{let i=localStorage.getItem(a);i!==null&&localStorage.setItem(`user_${t.toLowerCase()}_${a}`,i)})}restoreUserData(t){if(!t)return;["eduerror_student_twin_v3","eduerror_progress_v2","eduerror_screentime_seconds","eduerror_adhd_boost","eduerror_exam_attempts_history","eduerror_weekly_goals_manual","eduerror_mentor_sessions","eduerror_active_sess_id","eduerror_active_classroom","eduerror_student_enrolled_state","eduerror_last_chatted_topic","eduerror_last_read_topic","eduerror_last_active_date_v3","eduerror_last_active_date"].forEach(a=>{let i=localStorage.getItem(`user_${t.toLowerCase()}_${a}`);i!==null?localStorage.setItem(a,i):localStorage.removeItem(a)})}clearGlobalTelemetry(){["eduerror_progress_v2","eduerror_screentime_seconds","eduerror_adhd_boost","eduerror_exam_attempts_history","eduerror_weekly_goals_manual","eduerror_mentor_sessions","eduerror_active_sess_id","eduerror_active_classroom","eduerror_student_enrolled_state","eduerror_last_chatted_topic","eduerror_last_read_topic","eduerror_last_active_date_v3","eduerror_last_active_date"].forEach(e=>localStorage.removeItem(e))}handleSocialLogin(t,e){let a=e.innerHTML;e.innerHTML="Connecting Provider...",setTimeout(()=>{e.innerHTML=a,this.showSsoModal(t,e)},600)}completeSuccessfulAuth(t){let e=t.email.toLowerCase();localStorage.getItem(`user_${e}_eduerror_student_twin_v3`)!==null?this.restoreUserData(t.email):(this.clearGlobalTelemetry(),localStorage.removeItem("eduerror_student_twin_v3"));let i=document.getElementById("eduauth-toast");i&&(i.textContent=`Hello, ${t.firstName}! Welcome back to EduAI Suite.`,i.classList.add("eduauth-show"));let o=`${t.firstName} ${t.lastName}`.trim();try{let r={name:o||t.email,email:t.email,level:0,xp:0,nextLevelXp:1e3,streak:0,learningSpeed:"Balanced",preferredStyle:"Standard",accessibilityMode:"Default",weakConcepts:[],avatarUrl:"",bio:"",class:"Class",age:0,institution:"",country:"Bangladesh"},n=localStorage.getItem("eduerror_student_twin_v3"),s=n?JSON.parse(n):r;s.name=o||t.email,s.email=t.email,localStorage.setItem("eduerror_student_twin_v3",JSON.stringify(s))}catch(r){console.error("Error updating profile in student twin:",r)}this.backupUserData(t.email),localStorage.setItem("eduerror_logged_in","true"),localStorage.setItem("eduerror_current_user",JSON.stringify(t)),setTimeout(()=>{window.location.reload()},1500)}handleLogout(){let t=localStorage.getItem("eduerror_current_user");if(t)try{let e=JSON.parse(t);e&&e.email&&this.backupUserData(e.email)}catch(e){console.error("Failed to backup user data on logout",e)}localStorage.removeItem("eduerror_logged_in"),localStorage.removeItem("eduerror_current_user"),this.clearGlobalTelemetry(),localStorage.removeItem("eduerror_student_twin_v3"),window.location.reload()}};new w;})();
