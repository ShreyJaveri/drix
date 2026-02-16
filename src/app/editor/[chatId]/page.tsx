"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, Loader2, Code, Eye, MousePointer2, Save, 
  File as FileIcon, Plus, Smartphone, Tablet, Monitor, 
  Download, ArrowLeft, ChevronDown
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getChatMessages, getProjectFiles, saveFile, saveMessage } from "@/app/actions";
import { PropertiesPanel } from "@/app/editor/[chatId]/PropertiesPanel"; 
import Link from "next/link";
import JSZip from "jszip";

// --- TYPES ---
interface StyleMap {
  [key: string]: string;
}

interface ProjectFile {
  id?: number;
  name: string;
  content: string;
  type: string;
}

// 櫨 Pre-generated Google Fonts URL
const ALL_FONTS_URL = "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bangers&family=Caveat&family=Cinzel&family=Dancing+Script&family=Fredoka+One&family=Inter:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Lobster&family=Merriweather:wght@300;400;700&family=Montserrat:wght@300;400;600;700&family=Nunito:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Oswald:wght@300;400;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;600;700&family=Prata&family=Raleway:wght@300;400;700&family=Righteous&family=Roboto:wght@300;400;500;700&family=Shadows+Into+Light&family=Space+Grotesk:wght@300;400;700&family=Space+Mono&family=Syne:wght@400;700&family=Ubuntu:wght@300;400;700&family=VT323&display=swap";

export default function EditorPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId") ? parseInt(searchParams.get("chatId")!) : null;

  // --- STATES ---
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [iframeSource, setIframeSource] = useState<string>("");
  const [viewport, setViewport] = useState<"100%" | "768px" | "375px">("100%");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hi! I am Aura. Ready to build." }
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [view, setView] = useState<"preview" | "code">("preview");
  
  // 櫨 EDITOR STATE
  const [isEditMode, setIsEditMode] = useState(false);
  const [editState, setEditState] = useState<"normal" | "hover">("normal");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [selectedDataset, setSelectedDataset] = useState<any>({});
  
  // 櫨 FIX: Separate Normal and Hover Styles
  const [normalStyles, setNormalStyles] = useState<StyleMap>({});
  const [hoverStyles, setHoverStyles] = useState<StyleMap>({});

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- HELPERS ---

  const updateFileContent = (name: string, newContent: string) => {
    setFiles(prev => prev.map(f => f.name === name ? { ...f, content: newContent } : f));
    if (chatId) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveFile(chatId, name, newContent, "html");
        }, 1000);
    }
  };

  const forceReloadIframe = () => {
      setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdateStyle = (prop: string, val: string, state: "normal" | "hover") => {
    let finalVal = val;
    const pixelProps = ['width', 'height', 'margin', 'padding', 'fontSize', 'borderRadius', 'borderWidth', 'gap', 'top', 'left', 'right', 'bottom'];
    if (pixelProps.includes(prop) && !isNaN(Number(val)) && val.trim() !== "") {
        finalVal = `${val}px`;
    }

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ 
          type: "APPLY_STYLE", 
          style: prop, 
          value: finalVal,
          mode: state 
      }, "*");
      
      if (state === 'normal') {
        setNormalStyles((prev) => ({ ...prev, [prop]: finalVal }));
      } else {
        setHoverStyles((prev) => ({ ...prev, [prop]: finalVal }));
      }
    }
  };

  const handleUpdateContent = (text: string) => {
      setSelectedContent(text);
      if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: "UPDATE_CONTENT", text }, "*");
      }
  };

  const handleInsert = (html: string) => {
    iframeRef.current?.contentWindow?.postMessage({ type: "INSERT_COMPONENT", html }, "*");
  };

  const handleDelete = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "DELETE_SELECTED" }, "*");
  };

  // 🔥 EXPORT: Download Active File
  const handleDownloadCurrent = () => {
    const currentContent = files.find(f => f.name === activeFile)?.content;
    if (!currentContent) return;
    const element = document.createElement("a");
    const file = new Blob([currentContent], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = activeFile;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  // 🔥 EXPORT: Download All Files as ZIP
  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.name, file.content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = "project-files.zip";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 🔥 Handle complex interactions like updating Image Src or adding slides
  const handleAction = (action: string, value?: string) => {
    if (!iframeRef.current?.contentWindow) return;

    if (action === 'UPDATE_SRC') {
        iframeRef.current.contentWindow.postMessage({ 
            type: 'UPDATE_ATTR', 
            attribute: 'src', 
            value: value 
        }, "*");
    }

    if (action === 'ADD_SLIDE') {
        iframeRef.current.contentWindow.postMessage({ 
            type: 'DUPLICATE_CHILD' 
        }, "*");
    }
  };

  // --- PREVIEW GENERATOR ---
  const generatePreviewHtml = (targetFile: string, currentFiles: ProjectFile[]) => {
    const htmlFile = currentFiles.find(f => f.name === targetFile);
    if (!htmlFile) return `<html><body><h1>404: File not found</h1></body></html>`;
    
    let doc = htmlFile.content;

    // 1. Ensure Tailwind
    const hasTailwind = doc.includes('cdn.tailwindcss.com');
    const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>';

    if (!hasTailwind) {
        if (doc.includes('</head>')) {
            doc = doc.replace('</head>', `${tailwindScript}</head>`);
        } else if (doc.includes('<html>')) {
            doc = doc.replace('<html>', `<html><head>${tailwindScript}</head>`);
        } else {
            doc = `<!DOCTYPE html><html><head>${tailwindScript}</head><body>${doc}</body></html>`;
        }
    }

    // Embed Fonts
    const fontLink = `<link href="${ALL_FONTS_URL}" rel="stylesheet">`;
    if (doc.includes('<head>')) {
        doc = doc.replace('<head>', `<head>${fontLink}`);
    } else {
        doc = doc.replace('<html>', `<html><head>${fontLink}</head>`);
    }

    // 2. Inject Styles & Keyframes & JS Logic
    const scriptInjection = `
        <style>
            /* Editor UI Styles */
            *[data-selected="true"] { outline: 2px solid #3b82f6 !important; outline-offset: -2px; }
            body.edit-mode * { cursor: default; }
            body.edit-mode *:hover { outline: 1px dashed #94a3b8; cursor: pointer; }
            *[contenteditable="true"] { outline: 2px dashed #22c55e !important; cursor: text !important; }
            
            /* Scrollbar & Smooth Scroll */
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { bg: transparent; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            html { scroll-behavior: smooth; }
            body { perspective: 1000px; }

            /* ANIMATION KEYFRAMES */
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideLeft { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideRight { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes zoomIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
            @keyframes bounce { 0%, 100% { transform: translateY(-25%); } 50% { transform: translateY(0); } }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            @keyframes flip { 0% { transform: perspective(400px) rotateY(90deg); opacity: 0; } 100% { transform: perspective(400px) rotateY(0deg); opacity: 1; } }
        </style>
        <script id="aura-editor-script">
            window.isEditMode = ${isEditMode}; 
            if (window.isEditMode) document.body.classList.add('edit-mode');

            window.onbeforeunload = function(e) { e.preventDefault(); return false; };

            function getCleanHtml() {
                const docClone = document.documentElement.cloneNode(true);
                const script = docClone.querySelector('#aura-editor-script');
                if (script) script.remove();
                
                // Remove Editor-only styles
                const styles = docClone.querySelectorAll('style');
                styles.forEach(s => {
                    if (s.id !== 'aura-hover-styles' && (s.innerHTML.includes('aura-editor') || s.innerHTML.includes('data-selected') || s.innerHTML.includes('@keyframes'))) {
                         s.remove();
                    }
                });

                const links = docClone.querySelectorAll('link');
                links.forEach(l => {
                    if(l.href.includes('fonts.googleapis.com')) l.remove();
                });

                const body = docClone.querySelector('body');
                if (body) body.classList.remove('edit-mode');
                
                docClone.querySelectorAll('[data-selected]').forEach(el => el.removeAttribute('data-selected'));
                docClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
                
                return "<!DOCTYPE html>" + docClone.outerHTML;
            }

            // --- CLICK HANDLER ---
            window.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('#')) {
                        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
                        window.parent.postMessage({ type: 'LINK_CLICKED', href }, '*');
                        return;
                    }
                }

                if (!window.isEditMode) return;
                if (e.target.isContentEditable) return;
                e.preventDefault(); e.stopPropagation();
                
                if (window.selectedElement) {
                    window.selectedElement.removeAttribute('data-selected');
                    window.selectedElement.contentEditable = "false";
                }
                window.selectedElement = e.target;
                window.selectedElement.setAttribute('data-selected', 'true');
                
                const el = e.target;
                const computed = window.getComputedStyle(el);
                const inline = el.style;
                const getVal = (prop) => inline[prop] || computed[prop];

                // 🔥 Collect dataset for smart detection
                const dataset = {};
                for (const key in el.dataset) {
                    dataset[key] = el.dataset[key];
                }

                window.parent.postMessage({
                    type: 'ELEMENT_SELECTED',
                    tagName: el.tagName.toLowerCase(),
                    dataset: dataset, 
                    normalStyles: {
                        fontFamily: getVal('fontFamily'),
                        display: getVal('display'), width: getVal('width'), height: getVal('height'),
                        margin: getVal('margin'), padding: getVal('padding'),
                        color: getVal('color'), fontSize: getVal('fontSize'), fontWeight: getVal('fontWeight'), 
                        backgroundColor: getVal('backgroundColor'), borderRadius: getVal('borderRadius'),
                        boxShadow: getVal('boxShadow'), backdropFilter: getVal('backdropFilter'),
                        textAlign: getVal('textAlign'), position: getVal('position'), zIndex: getVal('zIndex'),
                        flexDirection: getVal('flexDirection'), justifyContent: getVal('justifyContent'), alignItems: getVal('alignItems'), gap: getVal('gap'),
                        
                        animationName: inline.animationName || computed.animationName,
                        animationDuration: inline.animationDuration || computed.animationDuration,
                        animationDelay: inline.animationDelay || computed.animationDelay,
                        animationTimingFunction: inline.animationTimingFunction || computed.animationTimingFunction,
                        animationIterationCount: inline.animationIterationCount || computed.animationIterationCount,
                        
                        transform: inline.transform || computed.transform, 
                        transition: inline.transition || computed.transition,
                        filter: inline.filter || computed.filter,
                        opacity: inline.opacity || computed.opacity,
                    },
                    content: el.innerText
                }, '*');
            }, true);

            document.addEventListener('dblclick', (e) => {
                if (window.isEditMode && e.target !== document.body) {
                    e.preventDefault(); e.stopPropagation();
                    e.target.contentEditable = "true";
                    e.target.focus();
                    e.target.onblur = () => {
                        e.target.contentEditable = "false";
                        window.parent.postMessage({ type: 'HTML_UPDATE', html: getCleanHtml() }, '*');
                    };
                }
            }, true);

            const toKebab = (str) => str.replace(/([A-Z])/g, '-$1').toLowerCase();

            window.addEventListener('message', (event) => {
              const data = event.data;
              if (data.type === 'TOGGLE_EDIT_MODE') {
                window.isEditMode = data.value;
                document.body.classList.toggle('edit-mode', data.value);
                if (!data.value && window.selectedElement) { 
                    window.selectedElement.removeAttribute('data-selected'); 
                    window.selectedElement = null; 
                }
              }
              
              if (data.type === 'APPLY_STYLE' && window.selectedElement) {
                if (data.mode === 'hover') {
                    if (!window.selectedElement.id) {
                        window.selectedElement.id = 'aura-' + Math.random().toString(36).substr(2, 6);
                    }
                    const elId = window.selectedElement.id;

                    let styleTag = document.getElementById('aura-hover-styles');
                    if (!styleTag) {
                        styleTag = document.createElement('style');
                        styleTag.id = 'aura-hover-styles';
                        document.head.appendChild(styleTag);
                    }

                    const cssProp = toKebab(data.style);
                    styleTag.innerHTML += \` #\${elId}:hover { \${cssProp}: \${data.value} !important; } \`;

                } else {
                    window.selectedElement.style[data.style] = data.value; 
                }
                
                window.parent.postMessage({ type: 'HTML_UPDATE', html: getCleanHtml() }, '*');
              }

              if (data.type === 'UPDATE_CONTENT' && window.selectedElement) {
                  window.selectedElement.innerText = data.text;
                  window.parent.postMessage({ type: 'HTML_UPDATE', html: getCleanHtml() }, '*');
              }
              if (data.type === 'INSERT_COMPONENT') {
                if (window.selectedElement) window.selectedElement.insertAdjacentHTML('afterend', data.html);
                else document.body.insertAdjacentHTML('beforeend', data.html);
                window.parent.postMessage({ type: 'HTML_UPDATE', html: getCleanHtml() }, '*');
              }
              if (data.type === 'DELETE_SELECTED' && window.selectedElement) {
                window.selectedElement.remove();
                window.selectedElement = null;
                window.parent.postMessage({ type: 'HTML_UPDATE', html: getCleanHtml() }, '*');
                window.parent.postMessage({ type: 'DESELECTED' }, '*');
              }
              if (data.type === 'UPDATE_ATTR' && window.selectedElement) {
                  window.selectedElement.setAttribute(data.attribute, data.value);
                  window.parent.postMessage({ type: 'HTML_UPDATE', html: getCleanHtml() }, '*');
              }
              if (data.type === 'DUPLICATE_CHILD' && window.selectedElement) {
                  let container = window.selectedElement;
                  if (container.children.length === 0) container = container.parentElement;
                  if (container && container.children.length > 0) {
                      const lastChild = container.children[container.children.length - 1];
                      const newSlide = lastChild.cloneNode(true);
                      container.appendChild(newSlide);
                      window.parent.postMessage({ type: 'HTML_UPDATE', html: getCleanHtml() }, '*');
                  }
              }
            });
        </script>
    `;

    if (doc.includes('</body>')) {
        doc = doc.replace('</body>', `${scriptInjection}</body>`);
    } else {
        doc += scriptInjection;
    }

    return doc;
  };

  // --- EFFECTS ---
  useEffect(() => { if (chatId) loadProjectData(); }, [chatId]);
  
  useEffect(() => { 
      if (files.length > 0 && view === 'preview') {
          setIframeSource(generatePreviewHtml(activeFile, files)); 
      }
  }, [activeFile, view, refreshTrigger, isEditMode]); 
  
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // --- MESSAGE HANDLER ---
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== "object") return;
      
      if (e.data.type === 'HTML_UPDATE') {
          updateFileContent(activeFile, e.data.html);
      }
      
      // 櫨 FIX: Separate normal styles and reset hover overrides on new selection
      if (e.data.type === 'ELEMENT_SELECTED') {
        setSelectedTag(e.data.tagName);
        setSelectedContent(e.data.content || "");
        setSelectedDataset(e.data.dataset || {}); // Store dataset for smart detection
        setNormalStyles(e.data.normalStyles);
        setHoverStyles({}); // Start with fresh hover state for new element
      }
      
      if (e.data.type === 'DESELECTED') {
        setSelectedTag(null); 
        setNormalStyles({});
        setHoverStyles({});
        setSelectedDataset({});
      }

      if (e.data.type === 'LINK_CLICKED') {
          const href = e.data.href;
          const targetName = href.replace(/^\.?\//, ''); 
          
          const targetFile = files.find(f => f.name === targetName || f.name === href);
          
          if (targetFile) {
              setActiveFile(targetFile.name); 
          } else {
              alert(`Page "${targetName}" does not exist for navigation, kindly create the page.`);
          }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files, activeFile]); 

  // --- API CALLS ---
  async function loadProjectData() {
    if(!chatId) return;
    setLoading(true);
    const dbFiles = await getProjectFiles(chatId);
    if (dbFiles.length > 0) { 
        setFiles(dbFiles); 
        setIframeSource(generatePreviewHtml("index.html", dbFiles)); 
    } else {
      const defaults = [{ name: "index.html", type: "html", content: '<div class="p-10 text-center"><h1 class="text-4xl font-bold text-blue-600">Welcome</h1></div>' }];
      setFiles(defaults); 
      defaults.forEach(f => saveFile(chatId, f.name, f.content, f.type)); 
      setIframeSource(generatePreviewHtml("index.html", defaults));
    }
    const dbMessages = await getChatMessages(chatId);
    if (dbMessages.length > 0) setMessages(dbMessages.map((m) => ({ role: m.role as "user" | "ai", content: m.content })));
    setLoading(false);
  }

  const createNewPage = () => {
    const name = window.prompt("Enter file name (e.g., about.html)");
    if (name && !files.find(f => f.name === name)) {
        const newFile = { name, type: "html", content: '<h1 class="text-2xl font-bold p-10">New Page</h1>' };
        const newFiles = [...files, newFile];
        setFiles(newFiles);
        if(chatId) saveFile(chatId, name, newFile.content, newFile.type);
        setActiveFile(name); 
        forceReloadIframe(); 
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !chatId) return;
    setLoading(true);
    
    const newMsgs = [...messages, { role: "user" as const, content: prompt }];
    setMessages(newMsgs); 
    setPrompt(""); 
    await saveMessage(chatId, "user", prompt);

    try {
      const res = await fetch("/api/generate", { 
          method: "POST", 
          body: JSON.stringify({ prompt, currentFiles: files, activeFile: activeFile }) 
      });

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      
      if (data.html) {
          const updatedFiles = files.map(f => f.name === activeFile ? { ...f, content: data.html } : f);
          setFiles(updatedFiles);
          await saveFile(chatId, activeFile, data.html, "html");
          forceReloadIframe(); 
      }
      
      setMessages((prev) => [...prev, { role: "ai", content: `I've updated the design.` }]);
      await saveMessage(chatId, "ai", `I've updated the design.`);
      
    } catch (err: any) { 
        setMessages((prev) => [...prev, { role: "ai", content: `Error: ${err.message}` }]); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleManualSave = async () => {
    if (!chatId) return; 
    setSaveLoading(true); 
    await saveMessage(chatId, "ai", "Visual edits saved."); 
    setSaveLoading(false); 
    alert("Project saved successfully!");
  };

  const toggleEditMode = (active: boolean) => {
    setIsEditMode(active); 
    setSelectedTag(null);
    iframeRef.current?.contentWindow?.postMessage({ type: 'TOGGLE_EDIT_MODE', value: active }, "*");
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      
      {/* LEFT SIDEBAR */}
      <div className="w-[300px] flex flex-col border-r bg-white h-full shrink-0">
        <div className="p-4 border-b bg-slate-50 shrink-0 flex items-center gap-2">
            <Link href="/" className="p-2 hover:bg-slate-200 rounded-lg transition"><ArrowLeft className="h-4 w-4 text-slate-600"/></Link>
            <span className="font-bold text-sm text-slate-700">Editor</span>
        </div>

        <div className="p-4 border-b bg-slate-50 shrink-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pages</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={createNewPage}><Plus className="h-4 w-4"/></Button>
            </div>
            <div className="space-y-1">
                {files.map(f => (
                    <div 
                        key={f.name} 
                        onClick={() => { setActiveFile(f.name); }} 
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer transition ${activeFile === f.name ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-slate-100 text-slate-700'}`}
                    >
                        <FileIcon className="h-4 w-4 text-blue-500"/>
                        {f.name}
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {messages.map((m, i) => (
                 <div key={i} className={`text-sm p-3 rounded-lg shadow-sm ${m.role === 'ai' ? 'bg-slate-100' : 'bg-blue-600 text-white self-end ml-auto max-w-[90%]'}`}>
                     {m.content}
                 </div>
             ))}
             {loading && <div className="text-xs text-slate-400 pl-2"><Loader2 className="h-3 w-3 animate-spin inline mr-2"/>Aura is coding...</div>}
             <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t bg-white shrink-0">
            <form onSubmit={handleSend} className="flex gap-2">
                <Input className="flex-1 bg-slate-50" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe change..." disabled={loading} />
                <Button type="submit" size="icon" disabled={loading} className="bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4"/></Button>
            </form>
        </div>
      </div>

      {/* RIGHT MAIN AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-100">
         
         {/* TOP TOOLBAR */}
         <div className="flex items-center justify-between border-b px-4 py-2 bg-white shadow-sm shrink-0 h-14 z-10">
            <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <Button size="sm" variant={view === "preview" ? "secondary" : "ghost"} onClick={() => setView("preview")} className="gap-2 text-xs h-7"><Eye className="h-3 w-3"/> Preview</Button>
                    <Button size="sm" variant={view === "code" ? "secondary" : "ghost"} onClick={() => setView("code")} className="gap-2 text-xs h-7"><Code className="h-3 w-3"/> Code</Button>
                </div>
                
                {view === "preview" && (
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <Button size="icon" variant="ghost" className={`h-7 w-7 ${viewport === '100%' ? 'bg-white shadow-sm' : ''}`} onClick={() => setViewport('100%')}><Monitor className="h-4 w-4 text-slate-600"/></Button>
                        <Button size="icon" variant="ghost" className={`h-7 w-7 ${viewport === '768px' ? 'bg-white shadow-sm' : ''}`} onClick={() => setViewport('768px')}><Tablet className="h-4 w-4 text-slate-600"/></Button>
                        <Button size="icon" variant="ghost" className={`h-7 w-7 ${viewport === '375px' ? 'bg-white shadow-sm' : ''}`} onClick={() => setViewport('375px')}><Smartphone className="h-4 w-4 text-slate-600"/></Button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* 櫨 EXPORT DROPDOWN */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="text-xs h-8 gap-2 hover:bg-slate-50">
                            <Download className="h-3 w-3"/> Export <ChevronDown className="h-3 w-3 opacity-50"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleDownloadCurrent} className="cursor-pointer">
                            Current File <span className="ml-auto text-xs text-slate-400">({activeFile})</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadZip} className="cursor-pointer">
                            Download All <span className="ml-auto text-xs text-slate-400">(.zip)</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button size="sm" variant="ghost" className="text-xs gap-2 h-8" disabled={saveLoading} onClick={handleManualSave}>
                    {saveLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3"/>} Save
                </Button>
                
                {view === "preview" && (
                    <Button 
                        size="sm" 
                        variant={isEditMode ? "default" : "outline"} 
                        className={`gap-2 text-xs h-8 ${isEditMode ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-200" : ""}`} 
                        onClick={() => toggleEditMode(!isEditMode)}
                    >
                        <MousePointer2 className="h-3 w-3" /> {isEditMode ? "Finish Editing" : "Visual Edit"}
                    </Button>
                )}
            </div>
         </div>

         {/* EDITOR CANVAS */}
         <div className="flex-1 relative flex overflow-hidden">
            <div className="flex-1 relative flex flex-col h-full overflow-hidden items-center bg-slate-200/50">
                {view === "preview" ? (
                    <div className="w-full h-full p-6 overflow-hidden flex flex-col items-center">
                        <div 
                            className="bg-white shadow-2xl transition-all duration-300 ease-in-out border border-slate-300 overflow-hidden relative flex-1"
                            style={{ width: viewport, borderRadius: viewport === '100%' ? '8px' : '20px', marginBottom: '24px' }}
                        >
                             <iframe 
                                ref={iframeRef} 
                                className="w-full h-full border-none block" 
                                srcDoc={iframeSource} 
                                sandbox="allow-scripts allow-same-origin" 
                                title="Preview"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-slate-950 flex flex-col w-full h-full">
                        <textarea 
                            className="flex-1 bg-transparent text-emerald-300 font-mono p-6 resize-none focus:outline-none text-sm leading-relaxed w-full h-full" 
                            value={files.find(f => f.name === activeFile)?.content || ""} 
                            onChange={(e) => {
                                updateFileContent(activeFile, e.target.value);
                                forceReloadIframe(); // Reload on Code Edit
                            }} 
                            spellCheck={false} 
                        />
                    </div>
                )}
            </div>
            
            <PropertiesPanel 
                isEditMode={isEditMode && view === 'preview'} 
                selectedTag={selectedTag}
                // 櫨 FIX: Merge logic: If Hover, show Normal merged with Hover Overrides
                selectedStyles={editState === 'normal' ? normalStyles : { ...normalStyles, ...hoverStyles }}
                selectedContent={selectedContent}
                editState={editState}
                setEditState={setEditState}
                onUpdateStyle={handleUpdateStyle}
                onUpdateContent={handleUpdateContent}
                onInsert={handleInsert}
                onDelete={handleDelete}
                onAction={handleAction}
                selectedDataset={selectedDataset}
            />
         </div>
      </div>
    </div>
  );
}