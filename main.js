

// Vee helper: expose sections and buildAssistantPrompt
(function(){
  try{
    const data = JSON.parse(localStorage.getItem('vee_data') || 'null');
    if(data && data.sections){ window.veeSections = data.sections; } else if(window.initialSections){ window.veeSections = window.initialSections; } else {
      window.veeSections = window.veeSections || [
        { id:'terminal', name:'ترمكس', subsections:[{id:'basics',name:'اساسيات الترمكس'},{id:'premium',name:'اومر مدفوع'}] },
        { id:'whatsapp', name:'واتساب', subsections:[{id:'reverse',name:'نسخة عكس'},{id:'bots',name:'بوتات'}] }
      ];
    }
  }catch(e){ window.veeSections = window.veeSections || []; }

  window.buildAssistantPrompt = function(payload){
    const userMsg = payload.message || '';
    if(payload.mode === 'tools' && payload.tool){
      const parts = payload.tool.split('::');
      const section = parts[0] || '';
      const subsection = parts[1] || '';
      let context = 'أنت مساعد متخصص في محتوى موقع Vee. قدم شرحًا عمليًا ومباشرًا مع أمثلة وأوامر وخطوات.';
      const sec = (window.veeSections||[]).find(s=>s.id===section);
      if(sec){
        context += ' القسم: ' + sec.name + '.';
        if(subsection){
          const sub = (sec.subsections||[]).find(ss=>ss.id===subsection);
          if(sub) context += ' الأداة: ' + sub.name + '.';
        }
      }
      context += ' ركز على خطوات عملية، أمثلة، وتحذيرات أمان إذا لزم.';
      return context + '\\n\\n' + 'سؤال المستخدم: ' + userMsg;
    }
    return 'أنت مساعد عام مفيد. أجب باللغة العربية وباختصار مفيد.\\n\\n' + userMsg;
  };
})();
