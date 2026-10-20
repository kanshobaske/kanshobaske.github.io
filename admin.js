(function(){
"use strict";
let news=newsData.map(x=>({...x})), schedules=scheduleData.map(x=>({...x})), photos=galleryData.map(x=>({...x}));
let editN=null,editS=null,editG=null;
const $=id=>document.getElementById(id), status=$("status");
const dot=v=>String(v||"").replace(/-/g,"."), inputDate=v=>String(v||"").replace(/\./g,"-").slice(0,10), display=v=>String(v||"").replace(/\./g,"/");
const say=t=>status.textContent=t;
const node=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
// 登録内容を、GitHubへ保存できるJavaScriptコードに整形します。
function output(name,items,comment){return "// "+comment+"\nconst "+name+" = "+JSON.stringify(items,null,2)+";\n";}
// コピー欄と直接保存欄を最新の入力データに更新します。
function refreshOutputs(){
$("n-output").value=output("newsData",news.slice().sort((a,b)=>inputDate(b.date).localeCompare(inputDate(a.date))),"ニュースデータ");
$("s-output").value=output("scheduleData",schedules.slice().sort((a,b)=>inputDate(b.fullDate).localeCompare(inputDate(a.fullDate))),"大会予定データ");
$("g-output").value=output("galleryData",photos,"大会写真データ");
}
// 登録済みの1件を一覧表示し、編集・削除ボタンを付けます。
function itemRow(container,title,meta,desc,index,onEdit,onDelete){
const row=node("div","item"),body=node("div","item-body"),actions=node("div","item-actions");
body.append(node("strong","",title||"（タイトルなし）"));if(meta)body.append(node("small","",meta));if(desc)body.append(node("p","",desc));
const edit=node("button","small","編集");edit.type="button";edit.onclick=()=>onEdit(index);
const del=node("button","small","削除");del.type="button";del.onclick=()=>onDelete(index);
actions.append(edit,del);row.append(body,actions);container.append(row);
}
// 登録一覧を空にしてから、データを1件ずつ画面へ描画します。
function fillList(id,arr,make){
const box=$(id);box.replaceChildren();if(!arr.length){box.append(node("p","empty","登録項目はありません。上のフォームから追加してください。"));return;}arr.forEach((x,i)=>make(box,x,i));
}
// ニュースフォームを初期状態に戻し、新規追加モードにします。
function resetN(){ $("form-news").reset();$("n-category").value="お知らせ";editN=null;$("n-save").textContent="ニュースを追加";$("n-cancel").hidden=true;}
// ニュースを登録一覧に反映し、保存用データも更新します。
function renderN(){
news.sort((a,b)=>inputDate(b.date).localeCompare(inputDate(a.date)));
fillList("n-items",news,(box,x,i)=>itemRow(box,x.title,display(x.date)+" ・ "+(x.category||"お知らせ"),x.desc,i,index=>{const v=news[index];$("n-date").value=inputDate(v.date);$("n-category").value=v.category||"お知らせ";$("n-title").value=v.title;$("n-desc").value=v.desc;editN=index;$("n-save").textContent="変更を保存";$("n-cancel").hidden=false;$("form-news").scrollIntoView({behavior:"smooth"});},index=>{if(confirm("このニュースを削除しますか？")){news.splice(index,1);resetN();renderN();if(tokenValue()) publishDirect("news"); else say("ニュースを管理画面から削除しました。公開サイトにも反映するには、GitHubトークンを設定して直接保存してください。");}}));
refreshOutputs();
}
$("form-news").onsubmit=e=>{e.preventDefault();const item={date:dot($("n-date").value),category:$("n-category").value,title:$("n-title").value.trim(),desc:$("n-desc").value.trim()};if(!item.date||!item.title||!item.desc){say("日付・タイトル・本文を入力してください。");return;}if(editN===null)news.push(item);else news[editN]=item;news.sort((a,b)=>inputDate(b.date).localeCompare(inputDate(a.date)));resetN();renderN();if(tokenValue()) publishDirect("news"); else say("ニュースを編集しました。公開サイトに反映するには、GitHubトークンを設定して直接保存してください。");};
$("n-cancel").onclick=resetN;

// 大会予定フォームを初期状態に戻します。
// 大会予定フォームを初期状態に戻します。終了日もここでクリアされます。
function resetS(){$("form-s").reset();$("s-type").value="official-game";$("s-badge").value="公式戦";editS=null;$("s-save").textContent="予定を追加";$("s-cancel").hidden=true;}
$("s-type").onchange=()=>{if(editS===null)$("s-badge").value=$("s-type").value==="official-game"?"公式戦":"練習試合";};
// 大会予定一覧に対戦相手・スコアなどを表示し、編集ボタンへ値を戻します。
function renderS(){
schedules.sort((a,b)=>inputDate(b.fullDate).localeCompare(inputDate(a.fullDate)));
fillList("s-items",schedules,(box,x,i)=>itemRow(box,x.title,display(x.fullDate)+(x.endDate?"〜"+display(x.endDate):"")+" ・ "+(x.badgeName||"予定")+(x.time?" ・ "+x.time:""),[x.opponent?"対戦相手："+x.opponent:"",x.result?"試合結果："+x.result:"",x.place?"会場："+x.place:"",x.comment||""].filter(Boolean).join("\n"),i,index=>{const v=schedules[index];$("s-date").value=inputDate(v.fullDate);$("s-end-date").value=inputDate(v.endDate||"");$("s-type").value=v.badgeType||"official-game";$("s-badge").value=v.badgeName||"";$("s-title").value=v.title||"";$("s-opponent").value=v.opponent||"";$("s-result").value=v.result||"";$("s-time").value=v.time||"";$("s-place").value=v.place||"";$("s-comment").value=v.comment||"";editS=index;$("s-save").textContent="変更を保存";$("s-cancel").hidden=false;$("form-s").scrollIntoView({behavior:"smooth"});},index=>{if(confirm("この予定を削除しますか？")){schedules.splice(index,1);resetS();renderS();if(tokenValue()) publishDirect("schedule"); else say("予定を管理画面から削除しました。公開サイトにも反映するには、GitHubトークンを設定して直接保存してください。");}}));
refreshOutputs();
}
// 入力された予定を日付形式に統一し、終了日がある場合は開始日より前にならないよう確認します。
$("form-s").onsubmit=e=>{
e.preventDefault();
const raw=$("s-date").value,endRaw=$("s-end-date").value,d=new Date(raw+"T12:00:00"),endD=endRaw?new Date(endRaw+"T12:00:00"):null;
if(!raw||Number.isNaN(d.getTime())){say("開催日を入力してください。");return;}
if(endRaw&&(!endD||Number.isNaN(endD.getTime())||endRaw<raw)){say("終了日は開催日と同じ日か、それより後の日付を選択してください。");return;}
const weekdays=["日","月","火","水","木","金","土"];
const item={
date:(d.getMonth()+1)+"/"+d.getDate()+(endD?"〜"+(endD.getMonth()+1)+"/"+endD.getDate():""),
fullDate:dot(raw),endDate:endRaw?dot(endRaw):"",
dayOfWeek:weekdays[d.getDay()]+(endD?"〜"+weekdays[endD.getDay()]:""),
badgeType:$("s-type").value,badgeName:$("s-badge").value.trim(),
title:$("s-title").value.trim(),opponent:$("s-opponent").value.trim()||"未定",
result:$("s-result").value.trim(),time:$("s-time").value.trim(),
place:$("s-place").value.trim(),comment:$("s-comment").value.trim()
};
if(!item.badgeName||!item.title){say("表示ラベルと大会・予定名を入力してください。");return;}
if(editS===null)schedules.push(item);else schedules[editS]=item;
schedules.sort((a,b)=>inputDate(b.fullDate).localeCompare(inputDate(a.fullDate)));
resetS();renderS();
if(tokenValue())publishDirect("schedule");
else say("大会予定を編集しました。公開サイトへ反映するには、更新用データをGitHubに保存してください。");
};
$("s-cancel").onclick=resetS;

// 写真フォームを初期状態に戻します。
function resetG(){$("form-g").reset();editG=null;$("g-save").textContent="写真情報を追加";$("g-cancel").hidden=true;}
// 写真の登録一覧を描画し、ファイルパスや説明を編集できるようにします。
function renderG(){
fillList("g-items",photos,(box,x,i)=>itemRow(box,x.title,(x.src||"")+(x.date?" ・ "+display(x.date):""),x.description,i,index=>{const v=photos[index];$("g-src").value=v.src||"";$("g-title").value=v.title||"";$("g-date").value=inputDate(v.date);$("g-desc").value=v.description||"";editG=index;$("g-save").textContent="変更を保存";$("g-cancel").hidden=false;$("form-g").scrollIntoView({behavior:"smooth"});},index=>{if(confirm("写真情報を削除しますか？写真ファイル自体はGitHubから別途削除してください。")){photos.splice(index,1);resetG();renderG();if(tokenValue()) publishDirect("gallery"); else say("写真情報を管理画面から削除しました。公開サイトにも反映するには、GitHubトークンを設定して直接保存してください。");}}));
refreshOutputs();
}
$("form-g").onsubmit=e=>{e.preventDefault();const item={src:$("g-src").value.trim(),title:$("g-title").value.trim(),date:$("g-date").value?dot($("g-date").value):"",description:$("g-desc").value.trim()};if(!item.src||!item.title){say("ファイルパスと写真タイトルを入力してください。");return;}if(editG===null)photos.push(item);else photos[editG]=item;resetG();renderG();if(tokenValue()) publishDirect("gallery"); else say("写真情報を編集しました。公開サイトに反映するにはGitHubトークンを設定して直接保存してください。写真ファイルもGitHubに追加されているか確認してください。");};
$("g-cancel").onclick=resetG;

// タブを押したら対応する編集パネルだけを表示します。
document.querySelectorAll(".tab").forEach(tab=>tab.onclick=()=>{document.querySelectorAll(".tab").forEach(t=>{t.classList.toggle("active",t===tab);t.setAttribute("aria-selected",String(t===tab));});["news","schedule","gallery"].forEach(name=>{$("panel-"+name).hidden=name!==tab.dataset.tab;});say("");});
// 保存用コードをクリップボードへコピーします。
async function copy(type){
const ids={news:"n-output",schedule:"s-output",gallery:"g-output"},files={news:"news-data.js",schedule:"schedule-data.js",gallery:"gallery-data.js"};
refreshOutputs();const text=$(ids[type]).value;
try{await navigator.clipboard.writeText(text);say(files[type]+" のコードをコピーしました。GitHubで編集して貼り付けてください。");}
catch(e){$(ids[type]).focus();$(ids[type]).select();say("コード欄を選択しました。Ctrl+Cでコピーしてください。");}
}
// GitHub保存先はこのサイトのリポジトリと main ブランチに固定しています。
const repositoryOwner="kanshobaske";
const repositoryName="kanshobaske.github.io";
const branchName="main";
const publishTargets={
 news:{path:"news-data.js",output:"n-output",label:"ニュース"},
 schedule:{path:"schedule-data.js",output:"s-output",label:"大会予定"},
 gallery:{path:"gallery-data.js",output:"g-output",label:"大会写真"}
};
function tokenValue(){return $("github-token").value.trim();}
// GitHub APIへアクセスし、トークンの権限や保存時のエラーを確認します。
async function githubApi(path,options){
 const token=tokenValue();
 if(!token) throw new Error("GitHubトークンを入力してください。");
 const response=await fetch("https://api.github.com/repos/"+repositoryOwner+"/"+repositoryName+"/contents/"+path,{
  method:options&&options.method?options.method:"GET",
  headers:{
   "Accept":"application/vnd.github+json",
   "Authorization":"Bearer "+token,
   "X-GitHub-Api-Version":"2022-11-28",
   "Content-Type":"application/json"
  },
  body:options&&options.body?JSON.stringify(options.body):undefined
 });
 let data={};
 try{data=await response.json();}catch(e){}
 if(!response.ok){
  if(response.status===401) throw new Error("認証に失敗しました。トークンが正しいか、有効期限が切れていないか確認してください。");
  if(response.status===403) throw new Error("保存権限がありません。対象リポジトリと Contents: Read and write の設定を確認してください。");
  if(response.status===404) throw new Error("リポジトリまたはファイルにアクセスできません。トークンの対象リポジトリ設定を確認してください。");
  if(response.status===409||response.status===422) throw new Error("GitHub側で競合が起きました。管理画面を再読み込みしてから、もう一度お試しください。");
  throw new Error(data.message||("GitHub APIエラー（"+response.status+"）"));
 }
 return data;
}
$("test-github-token").addEventListener("click",async function(){
 const button=this;
 button.disabled=true;
 $("github-token-status").textContent="GitHubへの接続を確認しています…";
 try{
  await githubApi("news-data.js");
  $("github-token-status").textContent="GitHubに接続できました。直接保存を使えます。";
  say("接続を確認しました。各項目の「GitHubに直接保存」を押すと変更が公開用リポジトリに保存されます。");
 }catch(error){
  $("github-token-status").textContent=error.message;
  say("接続を確認できませんでした。トークンと権限を確認してください。");
 }finally{button.disabled=false;}
});
$("clear-github-token").addEventListener("click",function(){
 $("github-token").value="";
 $("github-token-status").textContent="トークンを消しました。ページを閉じるときもトークンは保存されません。";
 say("管理画面からトークンを消しました。");
});
// 選択されたデータファイルをGitHubに直接保存します。トークンはファイルに保存しません。
async function publishDirect(type){
 const target=publishTargets[type];
 if(!target)return;
 if(!tokenValue()){say("最初にGitHubトークンを入力し、「接続を確認」を押してください。");$("github-token").focus();return;}
 refreshOutputs();
 const text=$(target.output).value;
 const buttons=Array.from(document.querySelectorAll("[data-publish]"));
 buttons.forEach(button=>button.disabled=true);
 say(target.label+"をGitHubに保存しています…");
 try{
  // 現在のファイルSHAを取得してから更新します。固定パス以外には書き込みません。
  const current=await githubApi(target.path);
  const result=await githubApi(target.path,{
   method:"PUT",
   body:{
    message:"Update "+target.label+" from site manager",
    content:(function(value){
      const bytes=new TextEncoder().encode(value);
      let binary="";
      for(let i=0;i<bytes.length;i++)binary+=String.fromCharCode(bytes[i]);
      return btoa(binary);
    })(text),
    sha:current.sha,
    branch:branchName
   }
  });
  say(target.label+"をGitHubに直接保存しました。コミット："+result.commit.sha.slice(0,7)+"。公開サイトに反映されるまで少し時間がかかる場合があります。");
 }catch(error){
  say("保存できませんでした："+error.message);
 }finally{buttons.forEach(button=>button.disabled=false);}
}
// 「GitHubに直接保存」ボタンを、該当データの保存処理につなぎます。
document.querySelectorAll("[data-publish]").forEach(button=>button.addEventListener("click",()=>publishDirect(button.dataset.publish)));
document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copy(b.dataset.copy));
renderN();renderS();renderG();
})();
