
let marksChart, attendanceChart, courseChart;
if(window.location.pathname.includes("dashboard.html")){
if(!localStorage.getItem("role")){
window.location.href="login.html";
}
}
const form=document.getElementById("studentForm");
const tableBody=document.querySelector("#studentTable tbody");

let students=JSON.parse(localStorage.getItem("students"))||[];
let facultyUsers=JSON.parse(localStorage.getItem("facultyUsers"))||[];

const admin={
username:"admin",
password:"admin123"
};

let currentRole=localStorage.getItem("role");
if(currentRole === "faculty"){
    const addBtn = document.querySelector(".navbar button:nth-child(1)");
    if(addBtn){
        addBtn.style.display = "none";
    }
}
let editIndex=-1;

updateDashboard();

function goRegister(){
window.location.href="register.html";
}

function backLogin(){
window.location.href="login.html";
}
/* LOGIN */

function login(){

const user=document.getElementById("username").value.trim();
const pass=document.getElementById("password").value.trim();

if(user==="admin" && pass==="admin123"){
localStorage.setItem("role","admin");
window.location.href="dashboard.html";
return;
}

const faculty=facultyUsers.find(f=>f.username===user && f.password===pass);

if(faculty){
localStorage.setItem("role","faculty");
window.location.href="dashboard.html";
}
else{
alert("Invalid Login");
}

}

function openDashboard(){

document.getElementById("loginScreen").style.display="none";
document.getElementById("registerScreen").style.display="none";
document.getElementById("dashboard").style.display="block";

document.getElementById("homeSection").style.display="block";
document.getElementById("addSection").style.display="none";
document.getElementById("viewSection").style.display="none";

if(currentRole==="faculty"){
document.querySelector(".navbar button:nth-child(1)").style.display="none";
}else{
document.querySelector(".navbar button:nth-child(1)").style.display="inline-block";
}

displayStudents();

}
function logout(){

localStorage.removeItem("role");
window.location.href="login.html";

}

/* REGISTER */

function showRegister(){
document.getElementById("loginScreen").style.display="none";
document.getElementById("registerScreen").style.display="block";
}

function backToLogin(){
document.getElementById("registerScreen").style.display="none";
document.getElementById("loginScreen").style.display="block";
}

function registerFaculty(){

const username=document.getElementById("regUsername").value.trim();
const password=document.getElementById("regPassword").value.trim();

if(!username || !password){
alert("Fill all fields");
return;
}

if(facultyUsers.some(f=>f.username===username)){
alert("Username exists");
return;
}

facultyUsers.push({username,password});
localStorage.setItem("facultyUsers",JSON.stringify(facultyUsers));

alert("Registration Successful");

backToLogin();

}

/* ADD STUDENT */

if(form){

form.addEventListener("submit", function(e){

e.preventDefault();

const marks = Number(document.getElementById("marks").value);

let grade="";

if(marks>=90) grade="A+";
else if(marks>=75) grade="A";
else if(marks>=60) grade="B";
else if(marks>=40) grade="C";
else grade="Fail";

const student={
roll:document.getElementById("roll").value,
name:document.getElementById("name").value,
course:document.getElementById("course").value,
contact:document.getElementById("contact").value,
year:document.getElementById("year").value,
date:document.getElementById("date").value,
attendance:Number(document.getElementById("attendance").value),
marks:marks,
grade:grade
};

if(students.some(s=>s.roll===student.roll) && editIndex===-1){
alert("Roll exists");
return;
}

if(editIndex===-1){
students.push(student);
}else{
students[editIndex]=student;
editIndex=-1;
}

localStorage.setItem("students",JSON.stringify(students));

form.reset();

displayStudents();

});

}

/* DISPLAY */

function displayStudents(data=students){

tableBody.innerHTML="";

data.forEach(student=>{

const realIndex=students.indexOf(student);
const row=document.createElement("tr");

if(student.attendance<75) row.classList.add("low-attendance");
if(student.grade==="Fail") row.classList.add("fail-row");

row.innerHTML=`

<td>${student.roll}</td>
<td>${student.name}</td>
<td>${student.course}</td>
<td>${student.contact}</td>
<td>${student.year}</td>
<td>${student.date}</td>
<td>${student.attendance}</td>
<td>${student.marks}</td>
<td>${student.grade}</td>
<td>
${currentRole==="admin"
?`<button class="edit-btn" onclick="editStudent(${realIndex})">✏ Edit</button>
<button class="delete-btn" onclick="deleteStudent(${realIndex})">🗑 Delete</button>`
:"View Only"}
</td>

`;

tableBody.appendChild(row);

});

updateDashboard();

}

function deleteStudent(index){

const sure = confirm("⚠ Are you sure you want to delete this student?");

if(sure){

students.splice(index,1);
localStorage.setItem("students",JSON.stringify(students));

alert("Student deleted successfully");

displayStudents();

}

}

/* EDIT */

function editStudent(index){

const s=students[index];

document.getElementById("roll").value=s.roll;
document.getElementById("name").value=s.name;
document.getElementById("course").value=s.course;
document.getElementById("contact").value=s.contact;
document.getElementById("year").value=s.year;
document.getElementById("attendance").value=s.attendance;
document.getElementById("marks").value=s.marks;

editIndex=index;

showAdd();

}

/* SORT */

function sortByMarks(){

students.sort((a,b)=>b.marks-a.marks);
localStorage.setItem("students",JSON.stringify(students));
displayStudents();

}
function filterGrade(g){

const filtered = students.filter(s => s.grade.startsWith(g));

displayStudents(filtered);

}
/* SEARCH */

function searchStudent(){

const roll=document.getElementById("searchRoll").value.trim();

const filtered=students.filter(s=>s.roll.toLowerCase().includes(roll.toLowerCase()));

displayStudents(filtered);

}

/* DASHBOARD */

function updateDashboard(){
    const low = students.filter(s=>s.attendance < 75);

const warning = document.getElementById("attendanceWarning");

if(warning){
if(low.length > 0){
warning.innerText = low.length + " students have low attendance!";
}else{
warning.innerText = "All students have good attendance.";
}
}

const total=students.length;

const avg=total?students.reduce((sum,s)=>sum+s.marks,0)/total:0;

let top="None";

if(total>0){

const topStudent=students.reduce((max,s)=>s.marks>max.marks?s:max);

top=topStudent.name+" ("+topStudent.marks+")";

}

animateValue("totalStudents",0,total,500);
document.getElementById("avgMarks").innerText=avg.toFixed(2);
document.getElementById("topStudent").innerText=top;

}

/* NAVIGATION */
function showAdd(){

if(currentRole !== "admin"){
alert("Only admin can add students");
return;
}

document.getElementById("addSection").style.display="block";
document.getElementById("viewSection").style.display="none";
document.getElementById("analyticsSection").style.display="none";

}

function showView(){

document.getElementById("addSection").style.display="none";
document.getElementById("viewSection").style.display="block";
document.getElementById("analyticsSection").style.display="none";

}
function showAnalytics(){

document.getElementById("addSection").style.display="none";
document.getElementById("viewSection").style.display="none";
document.getElementById("analyticsSection").style.display="block";

loadCharts();

}
function loadCharts(){

const names = students.map(s => s.name);
const marks = students.map(s => s.marks);
const attendance = students.map(s => s.attendance);
const courses = students.map(s => s.course);

/* destroy old charts */

if(marksChart) marksChart.destroy();
if(attendanceChart) attendanceChart.destroy();
if(courseChart) courseChart.destroy();

/* MARKS CHART */

marksChart = new Chart(document.getElementById("marksChart"),{
type:"bar",
data:{
labels:names,
datasets:[{
label:"Marks",
data:marks
}]
}
});

/* ATTENDANCE */

attendanceChart = new Chart(document.getElementById("attendanceChart"),{
type:"line",
data:{
labels:names,
datasets:[{
label:"Attendance %",
data:attendance
}]
}
});

/* COURSE PIE */

let courseCount={};

courses.forEach(c=>{
courseCount[c]=(courseCount[c]||0)+1;
});

courseChart = new Chart(document.getElementById("courseChart"),{
type:"pie",
data:{
labels:Object.keys(courseCount),
datasets:[{
data:Object.values(courseCount)
}]
}
});

}
function updateClock(){

const now = new Date();

const time = now.toLocaleTimeString();
const date = now.toLocaleDateString();

const clock = document.getElementById("clock");

if(clock){
clock.innerText = date + " | " + time;
}

}

setInterval(updateClock,1000);
updateClock();
const role = localStorage.getItem("role");

const welcome = document.getElementById("welcomeMsg");

if(welcome){
welcome.innerText = "Welcome " + role.toUpperCase();
}
function animateValue(id,start,end,duration){

let obj=document.getElementById(id);

if(!obj) return;   // prevents errors if element doesn't exist

let range=end-start;
if(range===0){
obj.innerText=end;
return;
}

let stepTime=Math.abs(Math.floor(duration/range));
let current=start;

let timer=setInterval(function(){

current++;
obj.innerText=current;

if(current>=end){
clearInterval(timer);
}

},stepTime);

}
