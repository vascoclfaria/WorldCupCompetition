const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links li");

hamburger.addEventListener('click', () => {
    //Animate Links
    navLinks.classList.toggle("open");
    links.forEach(link => {
        console.log("ENTREI");
        link.classList.toggle("fade");
    });

    //Hamburger Animation
    hamburger.classList.toggle("toggle");
});







/**
 * This method creates a new section/table to place games. Each section defines a 
 * phase of the competition
 * @param {*} name 
 */
function newSection(name){
    let tables = document.getElementById("tables");


    let section = document.createElement('section');
    section.classList.add("about_section");
    section.classList.add("layout_padding");
    section.classList.add("mt-4");

    let firstContainer = document.createElement('div');
    firstContainer.classList.add("about_container");

    let secoundContainer = document.createElement('div');
    secoundContainer.classList.add("container");

    let games = document.createElement('div');
    games.id = "games";

    let tournament = document.createElement('div');
    tournament.classList.add("fixture-index");
    tournament.classList.add("tournament");

    let span = document.createElement('span');
    span.innerHTML = name;

    tournament.appendChild(span);
    games.appendChild(tournament);
    secoundContainer.appendChild(games);
    firstContainer.appendChild(secoundContainer);
    section.appendChild(firstContainer);
    tables.appendChild(section);
}




function exitGame(){
    if(document.getElementById("empty").classList.contains("empty")){
      document.getElementById("empty").classList.remove('empty');
      document.querySelector(".popup").style.display = "none";
    }
  }




function canEdit(date_time, match_date_time){
    var date = date_time.split(", ")[0];
    var time = date_time.split(", ")[1];

    var day = date.split("/")[0];
    var month = date.split("/")[1];
    var months = ["Jan", "Fev", "Mar", "Abr", "Maio", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dez"];

    //Set date to correct form
    date = months[month] + " " + day;

    //Set time to correct form
    time = time.split(':').slice(0, 2).join(':');

    //TODO - check if it's still possible to change bet
}
