const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../src/screens/userScreens/NSMScreen");
const destDir = path.join(__dirname, "../src/screens/userScreens/RSMScreen");

const replacements = [
    [/Nsm/g, "Rsm"],
    [/NSM/g, "RSM"],
    [/attendance_nsm/g, "attendance_rsm"],
    [/National Sales/g, "Regional Sales"],
    [/National sales/g, "Regional sales"],
    [/profileInitial="N"/g, 'profileInitial="R"'],
    [/initials: "S"/g, 'initials: "R"'],
    [/department: "Warehouse"/g, 'department: "Regional Sales"'],
];

if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

for (const file of fs.readdirSync(srcDir)) {
    if (!file.endsWith(".jsx")) continue;
    let content = fs.readFileSync(path.join(srcDir, file), "utf8");
    for (const [from, to] of replacements) {
        content = content.replace(from, to);
    }
    const outName = file.replace(/Nsm/g, "Rsm");
    fs.writeFileSync(path.join(destDir, outName), content);
    console.log("Wrote", outName);
}
