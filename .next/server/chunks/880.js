exports.id=880,exports.ids=[880],exports.modules={2199:()=>{},2704:()=>{},5247:()=>{},5771:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,4160,23)),Promise.resolve().then(c.t.bind(c,1603,23)),Promise.resolve().then(c.t.bind(c,8495,23)),Promise.resolve().then(c.t.bind(c,5170,23)),Promise.resolve().then(c.t.bind(c,7526,23)),Promise.resolve().then(c.t.bind(c,8922,23)),Promise.resolve().then(c.t.bind(c,9234,23)),Promise.resolve().then(c.t.bind(c,2263,23)),Promise.resolve().then(c.bind(c,2146))},6953:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>h,metadata:()=>g});var d=c(5338),e=c(1288),f=c.n(e);c(2704);let g={title:"MagicStory | Histoires Magiques pour Enfants",description:"O\xf9 chaque enfant devient le h\xe9ros de sa propre l\xe9gende. Cr\xe9ez des histoires personnalis\xe9es avec l'IA."};function h({children:a}){return(0,d.jsx)("html",{lang:"fr",children:(0,d.jsx)("body",{className:f().className,children:a})})}},7676:(a,b,c)=>{"use strict";c.r(b),c.d(b,{"005978bcbd102e99a1bd4c1e8561eadb5fcaffdb49":()=>p,"00f24dee9cdfdda69fdd72755a8e1497a245344575":()=>r,"40082c46d831d770d646fa39e013d0ecf4383c885d":()=>B,"403b4c2c66a73096011e0fae043553b31317ce9403":()=>v,"405496594dce14d0e9649db39159f5c734ba4026d1":()=>A,"40baa263e8300de102f880a285a3b0235c493709c3":()=>z,"40bb369dfde087e5cfb6455d18580f4938ee1cd54b":()=>m,"40d81cacbddb94394f13a7ed2ef828ae67b1ffa109":()=>q,"40ff621d552c3f6c5e375a21a81cf304e6201de5e2":()=>y,"602ea3f373f9b63020994f45cd0efbc9f2831acf2e":()=>o,"60e12b2f8d14abc30095a415de698405abd2fa08f8":()=>l,"70bc3cd28d9814685615dd83b21d8be85e54513cda":()=>w,"78fda7dcfaee14119c2c03d863c12ac0586929266e":()=>k,"7c12f5ac62479e28c08a8bf03de51f346e5bb2d84b":()=>t,"7cd2617aac289dcbe69c94c6a0ab7ba9de70270b8c":()=>x,"7cded8bbb3f607fd2a57a8ed7c48d8ea9d8efaf18c":()=>n,"7f68d4a9738f65d67d6325f587c36357091304f259":()=>u,"7fe26f3219367bec4a83badc0205af817a12cbba34":()=>s});var d=c(1488);c(7806);var e=c(2046);let f="https://okoatevvkruiaveffudp.supabase.co",g="sb_publishable_QsA_MMJiWhJ6mbOJ--yipg_FPbqzh8M";if(!f||!g)throw Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.");let h=(0,e.UU)(f,g);var i=c(410);let j=process.env.OPENAI_API_KEY;async function k(a,b,c,d){try{let e;if(!j)return{data:null,error:"Cl\xe9 API non configur\xe9e"};if(d){let{data:c,error:f}=await m(d);if(f||!c)return{data:null,error:"Impossible d'acc\xe9der \xe0 la photo"};let g=c.signedUrl;e=`Create a cute children's book character illustration of a ${b} year old child named ${a}, based on this reference photo: ${g}

Style: soft, friendly, magical watercolor/storybook illustration style.
The character should maintain the SAME FACIAL FEATURES as the reference photo:
- Same face shape and structure
- Same eyes shape and color
- Same nose shape
- Same hair style and color
- Same skin tone
- Any distinctive features (freckles, glasses, etc.)

BUT transform it into a magical storybook character:
- Soft, painterly watercolor style
- Gentle, warm lighting
- Head and shoulders portrait
- Facing forward with a gentle, brave smile
- Expression should be kind and adventurous
- Background should be soft and magical (subtle sparkles or gentle gradient)

The result should look like the child from the photo, but illustrated in a beautiful children's book style.
No text, no letters in the image.`}else e=`Cute children's book character portrait of a ${b} year old child named ${a}. 
${c?`Physical description: ${c}. `:""}
Style: soft, friendly, magical watercolor illustration.
The character should look kind, brave and adventurous.
Warm colors, gentle lighting, storybook art style.
Head and shoulders portrait, facing forward with a gentle smile.
No text, no background elements, just the character on a soft neutral background.`;let f=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{Authorization:`Bearer ${j}`,"Content-Type":"application/json"},body:JSON.stringify({model:"dall-e-3",prompt:e,n:1,size:"1024x1024",quality:"standard",style:"vivid"})});if(!f.ok){let a=await f.json();return console.error("Erreur avatar:",a),{data:null,error:"Erreur lors de la g\xe9n\xe9ration de l'avatar"}}return{data:{avatarUrl:(await f.json()).data[0].url},error:null}}catch(a){return console.error("Exception avatar:",a),{data:null,error:"Erreur technique"}}}async function l(a,b){try{let c=a.name.split(".").pop()?.toLowerCase()||"jpg",d=b.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]/g,"_").substring(0,20),e=`${Date.now()}_${d}.${c}`,f=`photos/${e}`,{data:g,error:i}=await h.storage.from("avatars").upload(f,a,{cacheControl:"3600",upsert:!1});if(i)return console.error("Upload error:",i),{data:null,error:"Erreur lors de l'upload de la photo"};return{data:{path:f},error:null}}catch(a){return console.error("Exception upload:",a),{data:null,error:"Erreur technique lors de l'upload"}}}async function m(a){try{let{data:b,error:c}=await h.storage.from("avatars").createSignedUrl(a,3600);if(c)return console.error("Signed URL error:",c),{data:null,error:"Erreur lors de la g\xe9n\xe9ration du lien"};return{data:{signedUrl:b.signedUrl},error:null}}catch(a){return console.error("Exception signed URL:",a),{data:null,error:"Erreur technique"}}}async function n(a,b,c,d,e){try{let{data:f,error:g}=await h.from("profiles").insert([{first_name:a,age:b,favorite_hero:c,avatar_url:d||null,traits:e||[]}]).select().single();if(g)throw g;return{data:f,error:null}}catch(a){return console.error("Error creating child profile:",a),{data:null,error:"Erreur lors de la cr\xe9ation du profil"}}}async function o(a,b){try{let{data:c,error:d}=await h.from("profiles").update(b).eq("id",a).select().single();if(d)throw d;return{data:c,error:null}}catch(a){return console.error("Error updating child profile:",a),{data:null,error:"Erreur lors de la mise \xe0 jour du profil"}}}async function p(){try{let{data:a,error:b}=await h.from("profiles").select("*").order("created_at",{ascending:!1});if(b)throw b;return{data:a||[],error:null}}catch(a){return console.error("Error fetching profiles:",a),{data:null,error:"Erreur lors de la r\xe9cup\xe9ration des profils"}}}async function q(a){try{let{error:b}=await h.from("profiles").delete().eq("id",a);if(b)throw b;return{data:null,error:null}}catch(a){return console.error("Error deleting profile:",a),{data:null,error:"Erreur lors de la suppression"}}}async function r(){let a=process.env.OPENAI_API_KEY;return{configured:!!a,prefix:a?a.substring(0,20)+"...":"non d\xe9finie"}}async function s(a,b,c,d,e,f,g,i){try{if(console.log("\uD83D\uDD11 OPENAI_API_KEY pr\xe9sente:",!!j),!j)return console.error("❌ Cl\xe9 API OpenAI non configur\xe9e"),{data:null,error:"Cl\xe9 API OpenAI non configur\xe9e."};let k=null;try{let{data:b,error:c}=await h.from("profiles").select("id").eq("first_name",a).order("created_at",{ascending:!1}).limit(1).maybeSingle();b?(k=b.id,console.log("✅ Profil existant trouv\xe9:",k)):console.log("ℹ️ Aucun profil trouv\xe9 - histoire sera sauvegard\xe9e sans lien")}catch(a){console.log("ℹ️ Erreur recherche profil:",a)}let l=!!d,m=l?`DEUX H\xc9ROS : ${a} (${b} ans, ${c}) et ${d} (${e} ans, ${f}). Ils sont amis/partenaires et affrontent l'aventure ensemble.`:`H\xc9ROS : ${a}, un ${c} courageux de ${b} ans.`,n=l?Math.round((b+(e||b))/2):b,o=`Tu es un auteur de contes pour enfants expert. \xc9cris une histoire MAGIQUE et UNIQUE pour ${l?"deux enfants":"un enfant"}.

${m}
🌍 UNIVERS : ${g}  
📖 TH\xc8ME : ${i}

STRUCTURE NARRATIVE OBLIGATOIRE (respecte scrupuleusement) :

1️⃣ **D\xc9BUT** (1 paragraphe)
- Accroche imm\xe9diate qui pose l'ambiance magique
- Pr\xe9sentation ${l?"des deux h\xe9ros et leur complicit\xe9":"du h\xe9ros et son quotidien"} dans ${g}
- Un \xe9v\xe9nement d\xe9clencheur qui lance l'aventure

2️⃣ **D\xc9VELOPPEMENT** (2-3 paragraphes)
- Au moins 2 p\xe9rip\xe9ties/challenges \xe0 surmonter
- ${l?"Les deux h\xe9ros collaborent, chacun avec ses forces":"Le h\xe9ros fait face aux obstacles"}
- Des rencontres avec des personnages secondaires (amis ou cr\xe9atures)
- Des moments de tension puis de soulagement
- Le ${l?"groupe":"h\xe9ros"} fait preuve de ${"Aventure"===i?"courage et d\xe9brouillardise":"Amiti\xe9"===i?"g\xe9n\xe9rosit\xe9 et entraide":"curiosit\xe9 et sagesse"}

3️⃣ **CLIMAX** (1 paragraphe)
- Le moment le plus intense de l'histoire
- ${l?"Les h\xe9ros combinent leurs forces pour":"Le h\xe9ros surmonte le plus grand obstacle"}
- D\xe9nouement de l'aventure principale

4️⃣ **FIN** (1 paragraphe)
- Retour au calme, conclusion satisfaisante
- ${l?"Les deux h\xe9ros c\xe9l\xe8brent leur victoire ensemble":"Le h\xe9ros rentre chez lui transform\xe9"}
- Morale douce et adapt\xe9e \xe0 ${n} ans
- Note d'espoir ou d'\xe9merveillement

🎯 CONTRAINTES QUALIT\xc9 :
- Titre UNIQUE et accrocheur (pas de "L'aventure de..." banal)
- Ton ${n<6?"simple, r\xe9p\xe9titif et rassurant":n<9?"dynamique avec du dialogue":"plus riche en vocabulaire et descriptions"}
- \xc9vite les clich\xe9s et les histoires d\xe9j\xe0 racont\xe9es mille fois
- Cr\xe9e des d\xe9tails surprenants et m\xe9morables
- 500-800 mots environ
- Style : chaleureux, po\xe9tique, captivant

Format :
TITRE: [titre original et cr\xe9atif]
HISTOIRE: [ton histoire structur\xe9e]`;console.log("\uD83D\uDCDD Appel GPT-4...");let p=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${j}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"user",content:o}],temperature:.8,max_tokens:1500})});if(!p.ok){let a=await p.json().catch(()=>({}));return console.error("❌ Erreur GPT:",p.status,a),{data:null,error:`Erreur API OpenAI (${p.status})`}}let q=(await p.json()).choices[0].message.content,r=q.match(/TITRE:\s*(.+)/i),s=q.match(/HISTOIRE:\s*([\s\S]+)/i),t=r?r[1].trim():`L'aventure de ${a}${d?` et ${d}`:""}`,u=s?s[1].trim():q;console.log("✅ Histoire g\xe9n\xe9r\xe9e:",t);let v="";try{let b=`Children's book illustration in a soft, magical watercolor style: 
${l?`Two young heroes (${a} as ${c} and ${d} as ${f}) exploring ${g} together, showing teamwork and friendship.`:`A young ${c.toLowerCase()} named ${a} exploring ${g}.`}
${"Amiti\xe9"===i?"The scene shows friendship, sharing and kindness.":"Apprentissage"===i?"The scene shows discovery, curiosity and learning something new.":"The scene shows adventure, courage and excitement."}
Warm golden and purple colors, dreamy atmosphere, soft lighting, storybook art style, suitable for children age ${n}.
High quality, detailed, magical feeling.
No text, no words, no letters in the image.`;console.log("\uD83C\uDFA8 Appel DALL-E 3...");let e=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{Authorization:`Bearer ${j}`,"Content-Type":"application/json"},body:JSON.stringify({model:"dall-e-3",prompt:b,n:1,size:"1024x1024",quality:"standard",style:"vivid"})});if(console.log("\uD83C\uDFA8 Status DALL-E:",e.status),e.ok)v=(await e.json()).data[0].url,console.log("✅ Image g\xe9n\xe9r\xe9e:",v.substring(0,50)+"...");else{let a=await e.json().catch(()=>({}));console.error("❌ Erreur DALL-E:",a)}}catch(a){console.error("❌ Exception DALL-E:",a)}console.log("\uD83D\uDCBE Sauvegarde histoire:",{profile_id:k,title:t.substring(0,30),image_url:v?.substring(0,50)});let{data:w,error:x}=await h.from("stories").insert([{profile_id:k,title:t,content:u,image_url:v||null,theme:i}]).select().single();if(x)return console.error("❌ Erreur sauvegarde:",x),{data:null,error:`Erreur sauvegarde: ${x.message}`};if(!w)return console.error("❌ Pas de story retourn\xe9e apr\xe8s insertion"),{data:null,error:"Erreur: histoire non sauvegard\xe9e"};return console.log("✅ Histoire sauvegard\xe9e:",w.id),{data:{title:t,content:u,imageUrl:v,storyId:w.id},error:null}}catch(a){return console.error("\uD83D\uDCA5 Exception:",a),{data:null,error:`Erreur technique: ${a instanceof Error?a.message:"Inconnue"}`}}}async function t(a,b,c,d,e){return s(a,b,c,null,null,null,d,e)}async function u(a,b,c,d,e,f,g,i){try{let k;if(console.log("\uD83D\uDD11 OPENAI_API_KEY pr\xe9sente:",!!j),!j)return{data:null,error:"Cl\xe9 API OpenAI non configur\xe9e."};let l=!!d,m=l?`DEUX H\xc9ROS : ${a} (${b} ans, ${c}) et ${d} (${e} ans, ${f}). Ils sont amis/partenaires et affrontent l'aventure ensemble.`:`H\xc9ROS : ${a}, un ${c} courageux de ${b} ans.`,n=l?Math.round((b+(e||b))/2):b,o=`Tu es un auteur de contes interactifs pour enfants expert. \xc9cris une histoire DONT VOUS \xcaTES LE H\xc9ROS avec des CHOIX qui influencent le d\xe9roulement.

${m}
🌍 UNIVERS : ${g}  
📖 TH\xc8ME : ${i}
👶 \xc2GE CIBLE : ${n} ans

🎭 STRUCTURE INTERACTIVE OBLIGATOIRE (respecte scrupuleusement) :

L'histoire doit avoir 5 CHAPITRES avec exactement 2 CHOIX IND\xc9PENDANTS positionn\xe9s strat\xe9giquement :

**CHAPITRE 1 : Introduction**
- Pr\xe9sente le h\xe9ros, l'univers et la qu\xeate initiale
- Pas de choix ici, c'est la mise en place
- 150-200 mots

**CHAPITRE 2 : Premier obstacle**
- Le h\xe9ros fait face \xe0 un premier challenge
- \xc0 LA FIN : CHOIX 1 (positionn\xe9 ici, pas au d\xe9but)
- Question simple adapt\xe9e \xe0 ${n} ans
- Option A et Option B menant \xe0 des chemins diff\xe9rents
- 150-200 mots + choix

**CHAPITRE 3A ou 3B : Cons\xe9quence du premier choix**
- D\xe9veloppe ce qui arrive selon le choix fait au chapitre 2
- Montre les cons\xe9quences positives de la d\xe9cision
- Pas de choix ici, c'est le d\xe9veloppement
- 150-200 mots

**CHAPITRE 4 : Convergence et nouveau d\xe9fi**
- Les deux chemins se rejoignent (ou continuent parall\xe8lement vers le m\xeame objectif final)
- Un nouveau challenge survient
- \xc0 LA FIN : CHOIX 2 (positionn\xe9 ici, ind\xe9pendant du premier)
- Question diff\xe9rente, nouveau dilemme
- 150-200 mots + choix

**CHAPITRE 5A ou 5B : D\xe9nouement et fin**
- L'issue finale selon le deuxi\xe8me choix
- Deux fins possibles (heureuses mais diff\xe9rentes)
- Morale douce adapt\xe9e \xe0 ${n} ans
- 150-200 mots
- isEnding: true

🎯 CONTRAINTES QUALIT\xc9 :
- Titre UNIQUE et accrocheur
- Ton adapt\xe9 \xe0 ${n<6?"tr\xe8s simple, phrases courtes, vocabulaire basique":n<9?"dynamique avec dialogues simples":"plus riche mais accessible"}
- Les choix doivent \xeatre \xc9QUILIBR\xc9S (pas de "bonne" ou "mauvaise" r\xe9ponse \xe9vidente)
- Coh\xe9rence narrative : les cons\xe9quences doivent faire SENS
- Les deux chemins sont int\xe9ressants et valides
- Les fins doivent \xeatre satisfaisantes quel que soit le parcours

📤 FORMAT DE SORTIE JSON STRICT (respecte exactement cette structure) :

{
  "title": "Titre accrocheur de l'histoire",
  "coverImagePrompt": "Description d\xe9taill\xe9e pour DALL-E de l'illustration de couverture",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Titre du chapitre 1",
      "content": "Contenu du chapitre 1...",
      "hasChoice": false,
      "isEnding": false
    },
    {
      "chapterNumber": 2,
      "title": "Titre du chapitre 2",
      "content": "Contenu du chapitre 2 (s'arr\xeate juste avant le choix)...",
      "hasChoice": true,
      "choice": {
        "question": "Question du choix 1 ?",
        "optionA": { "text": "Option A", "nextChapter": 3 },
        "optionB": { "text": "Option B", "nextChapter": 4 }
      },
      "isEnding": false
    },
    {
      "chapterNumber": 3,
      "title": "Titre du chapitre 3A",
      "content": "Contenu si Option A choisie au chapitre 2...",
      "hasChoice": false,
      "isEnding": false
    },
    {
      "chapterNumber": 4,
      "title": "Titre du chapitre 3B (ou alternative)",
      "content": "Contenu si Option B choisie au chapitre 2...",
      "hasChoice": false,
      "isEnding": false
    },
    {
      "chapterNumber": 5,
      "title": "Titre du chapitre 4",
      "content": "Contenu du chapitre 4 (nouveau d\xe9fi, s'arr\xeate avant choix)...",
      "hasChoice": true,
      "choice": {
        "question": "Question du choix 2 ?",
        "optionA": { "text": "Option A", "nextChapter": 6 },
        "optionB": { "text": "Option B", "nextChapter": 7 }
      },
      "isEnding": false
    },
    {
      "chapterNumber": 6,
      "title": "Titre de la fin A",
      "content": "Contenu de la premi\xe8re fin possible...",
      "hasChoice": false,
      "isEnding": true
    },
    {
      "chapterNumber": 7,
      "title": "Titre de la fin B",
      "content": "Contenu de la deuxi\xe8me fin possible...",
      "hasChoice": false,
      "isEnding": true
    }
  ]
}

⚠️ IMPORTANT : 
- Retourne UNIQUEMENT le JSON valide, sans texte avant ou apr\xe8s
- Assure-toi que les nextChapter correspondent aux num\xe9ros de chapitres existants
- Les chapitres 3 et 4 sont les branches du premier choix
- Les chapitres 6 et 7 sont les fins selon le deuxi\xe8me choix`;console.log("\uD83C\uDFB2 G\xe9n\xe9ration histoire interactive...");let p=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${j}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4o",messages:[{role:"user",content:o}],temperature:.8,max_tokens:3500})});if(!p.ok){let a=await p.json().catch(()=>({}));return console.error("❌ Erreur GPT:",p.status,a),{data:null,error:`Erreur API OpenAI (${p.status})`}}let q=(await p.json()).choices[0].message.content;try{let a=(q.match(/```json\s*([\s\S]*?)```/)||q.match(/```\s*([\s\S]*?)```/)||[null,q])[1].trim();k=JSON.parse(a),console.log("✅ Histoire interactive pars\xe9e:",k.title)}catch(a){return console.error("❌ Erreur parsing JSON:",a),console.log("Contenu re\xe7u:",q.substring(0,500)),{data:null,error:"Erreur lors du parsing de l'histoire g\xe9n\xe9r\xe9e"}}let{title:r,coverImagePrompt:s,chapters:t}=k,u="";try{let b=s||`Children's book illustration: ${l?`Two young heroes (${a} as ${c} and ${d} as ${f}) on an adventure in ${g}. Interactive storybook style.`:`A young ${c.toLowerCase()} named ${a} on a magical adventure in ${g}.`}
      ${"Amiti\xe9"===i?"Warm friendship scene.":"Apprentissage"===i?"Discovery and wonder.":"Epic adventure scene."}
      Watercolor storybook style, magical lighting, suitable for children age ${n}. No text.`;console.log("\uD83C\uDFA8 G\xe9n\xe9ration illustration couverture...");let e=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{Authorization:`Bearer ${j}`,"Content-Type":"application/json"},body:JSON.stringify({model:"dall-e-3",prompt:b,n:1,size:"1024x1024",quality:"standard",style:"vivid"})});e.ok&&(u=(await e.json()).data[0].url,console.log("✅ Image couverture g\xe9n\xe9r\xe9e"))}catch(a){console.error("❌ Erreur image:",a)}let{data:v,error:w}=await h.from("stories").insert([{profile_id:null,title:r,content:`Histoire interactive avec ${t.length} chapitres et 2 choix strat\xe9giques.`,image_url:u,theme:i,story_type:"interactive"}]).select().single();if(w||!v)return console.error("❌ Erreur sauvegarde histoire:",w),{data:null,error:`Erreur sauvegarde: ${w?.message}`};console.log("✅ Histoire sauvegard\xe9e:",v.id);let x=t.map(a=>({story_id:v.id,chapter_number:a.chapterNumber,title:a.title||`Chapitre ${a.chapterNumber}`,content:a.content,has_choice:a.hasChoice,choice_question:a.choice?.question||null,choice_option_a:a.choice?.optionA?.text||null,choice_option_a_next_chapter:a.choice?.optionA?.nextChapter||null,choice_option_b:a.choice?.optionB?.text||null,choice_option_b_next_chapter:a.choice?.optionB?.nextChapter||null,is_ending:a.isEnding})),{error:y}=await h.from("chapters").insert(x);return y?console.error("❌ Erreur sauvegarde chapitres:",y):console.log("✅",t.length,"chapitres sauvegard\xe9s"),{data:{title:r,storyId:v.id,chapters:t,coverImageUrl:u},error:null}}catch(a){return console.error("\uD83D\uDCA5 Exception:",a),{data:null,error:`Erreur technique: ${a instanceof Error?a.message:"Inconnue"}`}}}async function v(a){try{let{data:b,error:c}=await h.from("chapters").select("*").eq("story_id",a).order("chapter_number",{ascending:!0});if(c)throw c;return{data:b||[],error:null}}catch(a){return console.error("Error fetching chapters:",a),{data:null,error:"Erreur lors de la r\xe9cup\xe9ration des chapitres"}}}async function w(a,b,c){try{let{data:d,error:e}=await h.from("profiles").insert([{first_name:a,age:b,favorite_hero:c}]).select().single();if(e)throw e;return{data:d,error:null}}catch(a){return console.error("Error creating profile:",a),{data:null,error:"Erreur lors de la cr\xe9ation du profil"}}}async function x(a,b,c,d,e){try{let{data:f,error:g}=await h.from("stories").insert([{profile_id:a,title:b,content:c,image_url:d,theme:e}]).select().single();if(g)throw g;return{data:f,error:null}}catch(a){return console.error("Error saving story:",a),{data:null,error:"Erreur lors de l'enregistrement de l'histoire"}}}async function y(a){try{let{data:b,error:c}=await h.from("stories").select("*").eq("profile_id",a).order("created_at",{ascending:!1});if(c)throw c;return{data:b||[],error:null}}catch(a){return console.error("Error fetching stories:",a),{data:null,error:"Erreur lors de la r\xe9cup\xe9ration des histoires"}}}async function z(a){try{let{data:b,error:c}=await h.from("stories").select(`
        *,
        profile:profiles(first_name, age, favorite_hero)
      `).eq("id",a).single();if(c||!b)return{data:null,error:"Histoire non trouv\xe9e"};return{data:b,error:null}}catch(a){return{data:null,error:"Erreur lors de la r\xe9cup\xe9ration"}}}async function A(a=50){try{let{data:b,error:c}=await h.from("stories").select(`
        *,
        profile:profiles(first_name, favorite_hero)
      `).order("created_at",{ascending:!1}).limit(a);if(c)throw c;return{data:b||[],error:null}}catch(a){return console.error("Error fetching stories:",a),{data:null,error:"Erreur lors de la r\xe9cup\xe9ration des histoires"}}}async function B(a){try{let{error:b}=await h.from("stories").delete().eq("id",a);if(b)throw b;return{data:null,error:null}}catch(a){return console.error("Error deleting story:",a),{data:null,error:"Erreur lors de la suppression de l'histoire"}}}(0,i.D)([k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B]),(0,d.A)(k,"78fda7dcfaee14119c2c03d863c12ac0586929266e",null),(0,d.A)(l,"60e12b2f8d14abc30095a415de698405abd2fa08f8",null),(0,d.A)(m,"40bb369dfde087e5cfb6455d18580f4938ee1cd54b",null),(0,d.A)(n,"7cded8bbb3f607fd2a57a8ed7c48d8ea9d8efaf18c",null),(0,d.A)(o,"602ea3f373f9b63020994f45cd0efbc9f2831acf2e",null),(0,d.A)(p,"005978bcbd102e99a1bd4c1e8561eadb5fcaffdb49",null),(0,d.A)(q,"40d81cacbddb94394f13a7ed2ef828ae67b1ffa109",null),(0,d.A)(r,"00f24dee9cdfdda69fdd72755a8e1497a245344575",null),(0,d.A)(s,"7fe26f3219367bec4a83badc0205af817a12cbba34",null),(0,d.A)(t,"7c12f5ac62479e28c08a8bf03de51f346e5bb2d84b",null),(0,d.A)(u,"7f68d4a9738f65d67d6325f587c36357091304f259",null),(0,d.A)(v,"403b4c2c66a73096011e0fae043553b31317ce9403",null),(0,d.A)(w,"70bc3cd28d9814685615dd83b21d8be85e54513cda",null),(0,d.A)(x,"7cd2617aac289dcbe69c94c6a0ab7ba9de70270b8c",null),(0,d.A)(y,"40ff621d552c3f6c5e375a21a81cf304e6201de5e2",null),(0,d.A)(z,"40baa263e8300de102f880a285a3b0235c493709c3",null),(0,d.A)(A,"405496594dce14d0e9649db39159f5c734ba4026d1",null),(0,d.A)(B,"40082c46d831d770d646fa39e013d0ecf4383c885d",null)},8819:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,1170,23)),Promise.resolve().then(c.t.bind(c,3597,23)),Promise.resolve().then(c.t.bind(c,6893,23)),Promise.resolve().then(c.t.bind(c,9748,23)),Promise.resolve().then(c.t.bind(c,6060,23)),Promise.resolve().then(c.t.bind(c,7184,23)),Promise.resolve().then(c.t.bind(c,9576,23)),Promise.resolve().then(c.t.bind(c,3041,23)),Promise.resolve().then(c.t.bind(c,1384,23))}};