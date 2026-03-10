// =======================
// CO3 & CO4: JS Essentials & Interactivity
// =======================

let marksChart, attendanceChart, courseChart;

// CO4: Redirect to login if role is not set
if(window.location.pathname.includes("dashboard.html")){
    if(!localStorage.getItem("role")){
        window.location.href="login.html";
    }
}

// CO2 & CO4: Selecting DOM elements
const form=document.getElementById("studentForm");
const tableBody=document.querySelector("#studentTable tbody");

// CO4: Local storage for persistent data
let students=JSON.parse(localStorage.getItem("students"))||[];
let facultyUsers=JSON.parse(localStorage.getItem("facultyUsers"))||[];

// CO4: Admin credentials
const admin={
    username:"admin",
    password:"admin123"
};

let currentRole=localStorage.getItem("role");

// CO4: Hide add button for faculty role
if(currentRole === "faculty"){
    const addBtn = document.querySelector(".navbar button:nth-child(1)");
    if(addBtn){
        addBtn.style.display = "none";
    }
}

let editIndex=-1;

// CO4: Initialize dashboard
updateDashboard();

// =======================
// Navigation Functions
// CO4: Event handling & DOM navigation
// =======================
function goRegister(){
    window.location.href="register.html";
}

function backLogin(){
    window.location.href="login.html";
}

// =======================
// LOGIN FUNCTIONALITY
// CO3: JS fundamentals (variables, conditions)
// CO4: DOM & event handling
// =======================
function login(){
    const user=document.getElementById("username").value.trim();
    const pass=document.getElementById("password").value.trim();

    // CO3: Admin login check
    if(user==="admin" && pass==="admin123"){
        localStorage.setItem("role","admin");
        window.location.href="dashboard.html";
        return;
    }

    // CO3 & CO4: Faculty login
    const faculty=facultyUsers.find(f=>f.username===user && f.password===pass);

    if(faculty){
        localStorage.setItem("role","faculty");
        window.location.href="dashboard.html";
    }
    else{
        alert("Invalid Login"); // CO4: JS alert (UI feedback)
    }
}

// =======================
// REGISTER FUNCTIONALITY
// CO2: Forms & Input Handling
// CO4: DOM manipulation & validation
// =======================
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

// =======================
// ADD STUDENT FUNCTIONALITY
// CO2: Forms & validation
// CO3: JS objects, arrays, conditions
// CO4: DOM manipulation
// =======================
if(form){
    form.addEventListener("submit", function(e){
        e.preventDefault();

        const marks = Number(document.getElementById("marks").value);

        // CO3: Grade calculation using conditions
        let grade="";
        if(marks>=90) grade="A+";
        else if(marks>=75) grade="A";
        else if(marks>=60) grade="B";
        else if(marks>=40) grade="C";
        else grade="Fail";

        // CO3: Creating student object
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

        // CO4: Check duplicate roll numbers
        if(students.some(s=>s.roll===student.roll) && editIndex===-1){
            alert("Roll exists");
            return;
        }

        if(editIndex===-1){
            students.push(student);
        } else {
            students[editIndex]=student;
            editIndex=-1;
        }

        localStorage.setItem("students",JSON.stringify(students));
        form.reset();

        displayStudents();
    });
}

// =======================
// DISPLAY STUDENTS
// CO4: DOM manipulation, dynamic table rendering
// =======================
function displayStudents(data=students){
    tableBody.innerHTML="";

    data.forEach(student=>{
        const realIndex=students.indexOf(student);
        const row=document.createElement("tr");

        // CO4: Conditional row styling
        if(student.attendance<75) row.classList.add("low-attendance");
        if(student.grade==="Fail") row.classList.add("fail-row");

        // CO4: Insert student data into table
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

// =======================
// EDIT / DELETE STUDENT
// CO3: JS objects & arrays
// CO4: DOM manipulation
// =======================
function deleteStudent(index){
    const sure = confirm("⚠ Are you sure you want to delete this student?");
    if(sure){
        students.splice(index,1);
        localStorage.setItem("students",JSON.stringify(students));
        alert("Student deleted successfully");
        displayStudents();
    }
}

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

// =======================
// SORT, FILTER, SEARCH
// CO3: JS arrays & methods
// CO4: DOM update
// =======================
function sortByMarks(){
    students.sort((a,b)=>b.marks-a.marks);
    localStorage.setItem("students",JSON.stringify(students));
    displayStudents();
}

function filterGrade(g){
    const filtered = students.filter(s => s.grade.startsWith(g));
    displayStudents(filtered);
}

function searchStudent(){
    const roll=document.getElementById("searchRoll").value.trim();
    const filtered=students.filter(s=>s.roll.toLowerCase().includes(roll.toLowerCase()));
    displayStudents(filtered);
}

// =======================
// DASHBOARD STATISTICS
// CO4: DOM updates, dynamic calculations
// =======================
function updateDashboard(){
    const low = students.filter(s=>s.attendance < 75);
    const warning = document.getElementById("attendanceWarning");

    if(warning){
        if(low.length > 0){
            warning.innerText = low.length + " students have low attendance!";
        } else {
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

    // CO4: Animate dashboard values
    animateValue("totalStudents",0,total,500);
    document.getElementById("avgMarks").innerText=avg.toFixed(2);
    document.getElementById("topStudent").innerText=top;
}

// =======================
// NAVIGATION BETWEEN SECTIONS
// CO4: DOM manipulation, role-based visibility
// =======================
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

// =======================
// CO5: Advanced Web Dev - Analytics & Chart.js
// =======================
function loadCharts(){
    const names = students.map(s => s.name);
    const marks = students.map(s => s.marks);
    const attendance = students.map(s => s.attendance);
    const courses = students.map(s => s.course);

    // destroy old charts
    if(marksChart) marksChart.destroy();
    if(attendanceChart) attendanceChart.destroy();
    if(courseChart) courseChart.destroy();

    // Marks Chart
    marksChart = new Chart(document.getElementById("marksChart"),{
        type:"bar",
        data:{
            labels:names,
            datasets:[{ label:"Marks", data:marks }]
        }
    });

    // Attendance Chart
    attendanceChart = new Chart(document.getElementById("attendanceChart"),{
        type:"line",
        data:{
            labels:names,
            datasets:[{ label:"Attendance %", data:attendance }]
        }
    });

    // Course Pie Chart
    let courseCount={};
    courses.forEach(c=>{ courseCount[c]=(courseCount[c]||0)+1; });
    courseChart = new Chart(document.getElementById("courseChart"),{
        type:"pie",
        data:{
            labels:Object.keys(courseCount),
            datasets:[{ data:Object.values(courseCount) }]
        }
    });
}

// =======================
// CO4: Clock & Welcome Message
// =======================
function updateClock(){
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();
    const clock = document.getElementById("clock");
    if(clock) clock.innerText = date + " | " + time;
}
setInterval(updateClock,1000);
updateClock();

const role = localStorage.getItem("role");
const welcome = document.getElementById("welcomeMsg");
if(welcome){
    welcome.innerText = "Welcome " + role.toUpperCase();
}

// =======================
// CO4: Animate numbers (dashboard cards)
// =======================
function animateValue(id,start,end,duration){
    let obj=document.getElementById(id);
    if(!obj) return;
    let range=end-start;
    if(range===0){ obj.innerText=end; return; }
    let stepTime=Math.abs(Math.floor(duration/range));
    let current=start;
    let timer=setInterval(function(){
        current++;
        obj.innerText=current;
        if(current>=end){ clearInterval(timer); }
    },stepTime);
}
