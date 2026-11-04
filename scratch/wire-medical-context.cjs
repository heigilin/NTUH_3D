const fs=require('fs');
const p='js/campus-immersion.js';let s=fs.readFileSync(p,'utf8');
const start=s.indexOf(' // College campus east of the hospital'),end=s.indexOf(' // Warm entrance lights',start);
if(start<0||end<0)throw Error('Medical context anchors changed');
s=s.slice(0,start)+` // Medical campus is a connected precinct south/east of the hospital.
 const {college,research,convention,museum,entrance}=window.CampusMedical.create(city,app.campusData);
 const landmarks={palace:{object:palace},park:{object:park},tower:{object:tower},cks:{object:cks},college:{object:college},research:{object:research},convention:{object:convention},museum:{object:museum}};
`+s.slice(end);
s=s.replace('[palace,tower,cks,college,research]','[palace,tower,cks,college,research,convention,museum]');fs.writeFileSync(p,s);
let html=fs.readFileSync('index.html','utf8');
html=html.replace(/  <script src="js\/campus-immersion.js\?v=[^"]+"><\/script>/,'  <script src="js/campus-medical.js?v=20261031-medical-plan-3"></script>\n  <script src="js/campus-immersion.js?v=20261031-medical-plan-3"></script>');
html=html.replace(/js\/app.js\?v=[^" ]+/,'js/app.js?v=20261031-xuzhou-north-medical-plan-3');fs.writeFileSync('index.html',html);
