const firebaseConfig = {
    apiKey: "AIzaSyA5JQWLWzWhwz2_btagzYGrtgIUeuCTxv8",
    authDomain: "world-cup-competition.firebaseapp.com",
    databaseURL: "https://world-cup-competition-default-rtdb.firebaseio.com",
    projectId: "world-cup-competition",
    storageBucket: "world-cup-competition.appspot.com",
    messagingSenderId: "48661212629",
    appId: "1:48661212629:web:4eed234bd4eaaae5cf215c"
};

//initialize variables
const firebaseApp = firebase.initializeApp(firebaseConfig); //initialize Firebase
const auth = firebase.auth(firebaseApp);
const db = firebase.database();
const gamesDB = db.ref('World Cup Competition');

let _player;
let matchesArray = []
let path = window.location.pathname;
let file = path.split("/").pop();
// console.log(file);

// //get username from local storage
_player = localStorage.getItem("username");
// console.log(_player)

switch (file) {
    case 'index.html':
        //go to register page
        // document.getElementById('btn_register').addEventListener('click', function (e) {
        //     e.preventDefault(); //stop form from submitting
        //     window.location.href = "register.html";
        // });

        //redirect to home page if user loged in
        document.getElementById('loginForm').style.display = "none";
        document.getElementById('loader').style.display = "flex";
        auth.onAuthStateChanged(function (user) {
            if (user) {
                let playerEmail = user.email;
                db.ref('Users').once("value", function (snapshot) {
                    var users = snapshot.val();
                    for (let u in users) {
                        db.ref('Users').child(u).once("value", function (snapshot) {
                            var user = snapshot.val();

                            // console.log("   ", user.email, playerEmail)
                            if (user.email == playerEmail) {
                                localStorage.setItem("username", u);
                                console.log("DEU: username")

                                console.log(localStorage.getItem("username"))
                                window.location.href = "home.html";
                            }
                        });
                    }
                });
            } else {
                document.getElementById('loginForm').style.display = "block";
                document.getElementById('loader').style.display = "none";
            }
        });

        //login player
        document.getElementById('loginForm').addEventListener('click', function (e) {
            e.preventDefault(); //stop form from submitting
            loginUser();
        });

        //firebase.auth().createUserWithEmailAndPassword("vasco.faria@hotmail.com", "1234")
        break;
    case "register.html":
        //register new user in DB
        document.getElementById('registerForm').addEventListener('click', function (e) {
            e.preventDefault(); //stop form from submitting
            registerUser();
        });
        break;
    case 'home.html':
        //check if is any user login in to access this page
        checkAuthorisation();

        //add all the games in the DB to welcome page
        document.getElementById('tables').style.display = "none";
        gamesDB.once("value", function (snapshot) {
            var phases = snapshot.val();
            for (let p in phases) {
                newSection(p);
                gamesDB.child(p).once("value", function (snapshot) {
                    var games = snapshot.val();
                    // console.log("games:", games)
                    games = sortByDate(games);
                    // console.log("games1:", games)
                    for (let g in games) {
                        gamesDB.child(p).child(g).once("value", function (snapshot) {
                            var game = snapshot.val();
                            var posName = "games_" + p.charAt(0);
                            var gameID = p.charAt(0) + "_game" + Object.keys(games).indexOf(g);
                            var playerBet = getPlayerBet(game.bets, _player);
                            // console.log(gameID, ": ", playerBet)

                            //console.log(gameID, home_team, away_team, match_info, match_score, match_bet, matchesArr);
                            newMatch(posName, gameID, game.home, game.away, game.info, game.score, playerBet, games);
                        })
                    }
                    // console.log(matchesArray);
                });
            }

            document.getElementById('tables').style.display = "block";
            document.getElementById('loader').style.display = "none";
        });

        //add prediction to database
        document.getElementById('betForm').addEventListener('submit', function (e) {
            e.preventDefault(); //stop form from submitting

            //db.ref('World Cup Competition/Fase de Grupos/-NEvZQxzPHZm-PApC-Vp');

            var home_team = document.getElementById('home_team_popup').innerHTML;
            var away_team = document.getElementById('away_team_popup').innerHTML;
            var home_score = document.getElementById('home_score_popup').value;
            var away_score = document.getElementById('away_score_popup').value;
            var bet = { key: _player, value: home_score + "-" + away_score };

            gamesDB.once("value", function (snapshot) {
                var phases = snapshot.val();
                for (let p in phases) {
                    gamesDB.child(p).once("value", function (snapshot) {
                        var games = snapshot.val();
                        for (let g in games) {
                            gamesDB.child(p).child(g).once("value", function (snapshot) {
                                var game = snapshot.val();
                                var home = game.home;
                                var away = game.away;
                                var info = game.info;
                                var bets = game.bets;

                                console.log("bets: ", bets);
                                console.log(home, home_team, " || ", away, away_team);

                                if (home == home_team && away == away_team) {
                                    if (!canBet(new Date(info))) {
                                        document.getElementById('error_msg').innerHTML = "O tempo para apostar/alterar aposta terminou";
                                        //alert("O tempo para apostar/alterar aposta terminou");
                                    }
                                    else if (home_score == "" || away_score == "") {
                                        // alert("Aposta inválida");
                                        document.getElementById('error_msg').innerHTML = "Aposta inválida";
                                    }
                                    else {
                                        //Update bet in DB World Cup Competition
                                        bets[bet.key] = bet.value;
                                        console.log("AAAAAA:", bets);
                                        gamesDB.child(p).child(g).update({
                                            bets: bets
                                        });

                                        //Update bet in DB Users
                                        console.log('Users/' + _player)
                                        db.ref('Users/' + _player).once("value", function (snapshot) {
                                            var user = snapshot.val();
                                            var bets = user.bets;

                                            bets[g] = bet.value;
                                            db.ref('Users/' + _player).update({
                                                bets: bets
                                            });

                                            window.location.reload();
                                        });


                                        document.getElementById('error_msg').innerHTML = "Aposta colocada";
                                        document.getElementById('error_msg').style.color = "green";
                                        // alert("Aposta colocada");
                                        // window.location.reload();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        });
        break;
    case 'admin.html':

        document.getElementById('loader').style.display = "flex";
        auth.onAuthStateChanged(function (user) {
            if(user){
                let adminEmail = user.email;
                console.log("TOU LOGINADO")
                if (adminEmail === "90215goncalopinto@gmail.com" || adminEmail === "vasco.faria@hotmail.com") {
                    console.log("SOU ADMIN")
                    document.getElementById('loader').style.display = "none";
                    document.getElementById("empty").classList.remove('empty');

                    //create datalist of games in DB
                    gamesDB.once("value", function (snapshot) {
                        var phases = snapshot.val();
                        for (let p in phases) {
                            gamesDB.child(p).once("value", function (snapshot) {
                                var games = snapshot.val();
                                for (let g in games) {
                                    gamesDB.child(p).child(g).once("value", function (snapshot) {
                                        var game = snapshot.val();

                                        let list = document.getElementById("games");
                                        let option = document.createElement('option');
                                        option.value = game.home + " - " + game.away + " (" + game.info.split("T")[0] + ")";
                                        option.id = p.replace(/\s/g, "-") + " " + g;
                                        list.appendChild(option);

                                        // console.log(option.value);
                                    });
                                }
                            });
                        }
                    });

                    //add new game to competition
                    document.getElementById('gameForm').addEventListener('submit', function (e) {
                        e.preventDefault(); //stop form from submitting

                        var phase = document.getElementById('phase').value;
                        var home = document.getElementById('home').value;
                        var away = document.getElementById('away').value;
                        var info = document.getElementById('info').value;
                        var bets = { "Nome do apostador": "Aposta" }

                        var ref = firebase.database().ref('World Cup Competition/' + phase)
                        var game = ref.push();
                        game.set({
                            home: home,
                            away: away,
                            info: info,
                            bets: bets,
                            score: ""
                        })

                        alert("Jogo colocado na base de dados");

                        document.getElementById('phase').value = "";
                        document.getElementById('home').value = "";
                        document.getElementById('away').value = "";
                        document.getElementById('info').value = "";
                    });

                    //add score to a game
                    document.getElementById('scoreForm').addEventListener('submit', function (e) {
                        e.preventDefault(); //stop form from submitting

                        var input = document.getElementById('game');
                        var datalist = document.getElementById('games');
                        var id = datalist.querySelector(`[value="${input.value}"]`).id;
                        var phase = id.split(" ")[0].replace(/-/g, ' ');
                        var game = id.split(" ")[1];
                        var score = document.getElementById('score').value;
                        console.log("GAME: ", phase, game, score)

                        gamesDB.child(phase).child(game).update({
                            score: score
                        });


                        var usersDB = db.ref("Users");
                        usersDB.once("value", function (snapshot) {
                            var users = snapshot.val();
                            // console.log("Bets: ", users);
                            for (let u in users) {
                                usersDB.child(u).once("value", function (snapshot) {
                                    var user = snapshot.val();
                                    // console.log("Bets: ", user);
                                    var bets = user.bets;
                                    // var points = parseInt(user.points);
                                    var points = 0; //USAR ESTA LINHA SO PARA TESTES AO SITE
                                    console.log(u)
                                    for (b in bets) {
                                        if (b === game) { //if (b != "GameRef") {
                                            var bet = bets[b];
                                            // console.log("Bets: ", bet);
                                            var x = bet.split("-")[0];
                                            var y = bet.split("-")[1];
                                            var sx = score.split("-")[0];
                                            var sy = score.split("-")[1];
                                            // console.log("VALOR: ", Math.abs(x - y), x, y)
                                            console.log("PHASE: ", phase)
                                            let pointsTable = getPointsTable(phase);
                                            console.log(pointsTable)

                                            if (correctPrediction(score, bet)) {
                                                if (x == sx && y == sy) {
                                                    points += pointsTable["correct"];
                                                }   //             Diferença de golos                                         Ficar a 1 golo do resultado certo
                                                else if (Math.abs(x - y) == Math.abs(sx - sy)    ||    x == sx && y == sy+1 || x == sx && y == sy-1  || x == sx-1 && y == sy || x == sx+1 && y == sy ) {     //Math.abs(x - y) + 1 == Math.abs(sx - sy) || Math.abs(x - y) - 1 == Math.abs(sx - sy)
                                                    points += pointsTable["diffGoals"];
                                                }
                                                else {
                                                    points += pointsTable["winTieDef"];
                                                }
                                            } else if (x == sx && y == sy+1 || x == sx && y == sy-1  ||  x == sx+1 && y == sy || x == sx-1 && y == sy) {
                                                points += pointsTable["oneAway"];
                                            }

                                            // console.log("   Points: ", points);
                                            usersDB.child(u).update({
                                                points: points
                                            });
                                        }
                                    }
                                    console.log("---------------------------------")

                                });
                            }
                        });

                        alert("Jogo colocado na base de dados");

                        document.getElementById('game').value = "";
                        document.getElementById('score').value = "";
                    });

                }else{
                    window.location.href = "home.html";
                }
            } else {
                window.location.href = "index.html";
            }
        });


        break;
    case 'classification.html':
        //check if is any user login in to access this page
        checkAuthorisation();

        //create PlayerScores table and fill it with the players
        let scores_table = document.getElementById('scores_table');
        scores_table.style.display = "none";

        newTable();

        var usersDB = db.ref("Users");
        usersDB.once("value", function (snapshot) {
            var users = snapshot.val();
            users = sortByPoints(users);
            // console.log("Users:", users)
            var count = 1;
            for (let u in users) {
                usersDB.child(u).once("value", function (snapshot) {
                    var user = snapshot.val();
                    // console.log("user: ", user);
                    newTableEntry(u, user, count);
                    count++;
                });
            }

            document.getElementById('scores_table').style.display = "block";
            document.getElementById('loader').style.display = "none";
        });
        break;
    case 'opponentBets.html':
        //check if is any user login in to access this page
        checkAuthorisation();

        //get opponent username
        let oppUsename = localStorage.getItem("opponent");

        //Show opponent name at the top
        let oppName = document.getElementById('oppUsername');
        let arrLetters = oppUsename.split('');
        for (let l in arrLetters) {
            let span = document.createElement('span');
            span.innerHTML = arrLetters[l];
            oppName.appendChild(span);
        }

        //show opponent bets
        document.getElementById('tables').style.display = "none";
        document.getElementById('msg').style.display = "none";
        var usersDB = db.ref("Users/" + oppUsename + "/bets");
        let count = 0;
        newSection("Apostas")
        usersDB.once("value", function (snapshot) {
            var bets = snapshot.val();
            console.log("Apostas: ", bets);
            for (let b in bets) {
                // console.log("gameBet",b);
                gamesDB.once("value", function (snapshot) {
                    var fase = snapshot.val();
                    // console.log("Fase: ", fase);
                    for (let f in fase) {
                        // console.log(f);
                        gamesDB.child(f).once("value", function (snapshot) {
                            var games = snapshot.val();
                            var gamesKeys = Object.keys(games);
                            // console.log("games: ", games);
                            for (let g in games) {
                                console.log(g, gamesKeys[gamesKeys.length - 1])
                                if (g === b) {
                                    console.log("+1 JOGO ")
                                    count++;
                                    gamesDB.child(f).child(g).once("value", function (snapshot) {
                                        var game = snapshot.val();
                                        var gameID = "game_" + count;
                                        var playerBet = getPlayerBet(game.bets, oppUsename);
                                        // console.log(gameID, ": ", playerBet)

                                        //console.log(gameID, home_team, away_team, match_info, match_score, match_bet, matchesArr);
                                        if (!canBet(new Date(game.info))) {
                                            newMatch1(gameID, game.home, game.away, game.info, game.score, playerBet, games);
                                            document.getElementById('tables').style.display = "block";
                                            document.getElementById('msg').style.display = "none";
                                        }
                                        else {
                                            document.getElementById('msg').style.display = "block";
                                        }

                                        // console.log(g, gamesKeys[gamesKeys.length - 1])
                                        // if(g === gamesKeys[gamesKeys.length - 1]){
                                        //     console.log("SOU O ULTIMO ", count)
                                        //     document.getElementById('msg').style.display = "block";
                                        // }
                                    });
                                } else if (g === gamesKeys[gamesKeys.length - 1] && count == 0) {
                                    console.log("SOU O ULTIMO ", count)
                                    document.getElementById('msg').style.display = "block";
                                }
                            }
                        });
                    }
                    // console.log("game: ", game);
                });
            }
            document.getElementById('loader').style.display = "none";
        });
        break;
    default:
    //TODO
}

function getPointsTable(competitionPhase) {
    let table = {}
    switch (competitionPhase) {
        case "Fase de Grupos":
            table = {
                "correct": 5,
                "diffGoals": 3,
                "winTieDef": 2,
                "oneAway": 1
            };
            break;
        case "Oitavos":
            table = {
                "correct": 10,
                "diffGoals": 6,
                "winTieDef": 4,
                "oneAway": 2
            };
            break;
        case "Quartos":
            table = {
                "correct": 15,
                "diffGoals": 9,
                "winTieDef": 6,
                "oneAway": 3
            };
            break;
        case "Semi-Final":
            table = {
                "correct": 20,
                "diffGoals": 12,
                "winTieDef": 8,
                "oneAway": 4
            };
            break;
        case "Final":
            table = {
                "correct": 25,
                "diffGoals": 15,
                "winTieDef": 10,
                "oneAway": 5
            };
            break;

        default:
            break;
    }
    return table;
}

function newTable() {
    let div = document.createElement('div');
    div.classList.add("about_section");
    div.classList.add("layout_padding");
    div.classList.add("mt-4");

    let firstContainer = document.createElement('div');
    firstContainer.classList.add("about_container");

    let secoundContainer = document.createElement('div');
    secoundContainer.classList.add("container");

    let classification = document.createElement('div');
    classification.classList.add("classification");

    let wrapper = document.createElement('div');
    wrapper.classList.add("wrapper");

    let table = document.createElement('div');
    table.classList.add("table");
    table.id = "table";

    let header = document.createElement('div');
    header.classList.add("row");
    header.classList.add("header");

    let posT = document.createElement('div');
    posT.classList.add("cell");
    posT.innerHTML = "#"

    let nameT = document.createElement('div');
    nameT.classList.add("cell");
    nameT.innerHTML = "Nome"

    let pointsT = document.createElement('div');
    pointsT.classList.add("cell");
    pointsT.innerHTML = "Pontos"

    header.appendChild(posT);
    header.appendChild(nameT);
    header.appendChild(pointsT);
    table.appendChild(header);
    wrapper.appendChild(table);
    classification.appendChild(wrapper);
    secoundContainer.appendChild(classification);
    firstContainer.appendChild(secoundContainer);
    div.appendChild(firstContainer);
    scores_table.appendChild(div);
}

function newTableEntry(username, userdata, position) {
    let table = document.getElementById("table");

    let row = document.createElement('div');
    row.classList.add("row");
    if (username != _player) {
        row.style.cursor = 'pointer';
        row.onclick = function (event) {
            localStorage.setItem("opponent", username);
            window.location.href = "opponentBets.html";
        }
    }


    let pos = document.createElement('div');
    pos.classList.add("cell");
    pos.setAttribute("data-title", "#");
    pos.innerHTML = position + "º";

    let name = document.createElement('div');
    name.classList.add("cell");
    name.setAttribute("data-title", "Nome");
    name.innerHTML = username;

    let points = document.createElement('div');
    points.classList.add("cell");
    points.setAttribute("data-title", "Pontos");
    points.innerHTML = userdata.points;

    if (username === _player) {
        row.style.backgroundColor = "rgba(110, 15, 47, 0.95)";
        pos.style.color = "white"
        name.style.color = "white"
        points.style.color = "white"
    }

    row.appendChild(pos);
    row.appendChild(name);
    row.appendChild(points);
    table.appendChild(row);
}

function correctPrediction(score, bet) {
    var x = bet.split("-")[0];
    var y = bet.split("-")[1];
    var sx = score.split("-")[0];
    var sy = score.split("-")[1];

    //          TEAM 1 GANHA               TEAM 2 GANHA                 EMPATAM
    if ((sx - sy < 0 && x - y < 0) || (sx - sy > 0 && x - y > 0) || (sx - sy == 0 && x - y == 0)) {
        return true;
    }


    return false;
}

/**
 * This method sorts the games in the DB by there date. The sonner the games is
 * the earliest it appeares in the game table
 *
 * @param {*} arrDB
 */
function sortByDate(arrDB) {
    let keys = [];
    let values = [];
    for (let ele in arrDB) {
        keys.push(ele);
        values.push(arrDB[ele])
    }

    //Sort games by date
    values.sort((a, b) => (a.info < b.info ? -1 : 1));

    let aux = {};
    for (let idx in values) {
        let key = Object.keys(arrDB).find(key => arrDB[key] === values[idx])
        let value = values[idx]

        aux[key] = value;
    }

    return aux;
}

/**
 * This method sorts the users in the DB by points. Higher the points higher the
 * players position in the classification table
 * @param {*} arrDB
 */
function sortByPoints(arrDB) {
    let keys = [];
    let values = [];
    for (let ele in arrDB) {
        keys.push(ele);
        values.push(arrDB[ele])
    }

    //Sort games by date
    values.sort((a, b) => (a.points < b.points ? 1 : -1));

    let aux = {};
    for (let idx in values) {
        let key = Object.keys(arrDB).find(key => arrDB[key] === values[idx])
        let value = values[idx]

        aux[key] = value;
    }

    return aux;
}
/**
 * This method creates a new section/table to place games. Each section defines a
 * phase of the competition
 * @param {*} name
 */
function newSection(name) {
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
    games.id = "games_" + name.charAt(0);

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

/**
 * This method creates a new entry on the table for the game
 * in question
 *
 * @param {*} gameID
 * @param {*} home_team
 * @param {*} away_team
 * @param {*} match_info
 * @param {*} match_score
 * @param {*} match_bet
 * @param {*} matchesArr
 */
function newMatch(posName, gameID, home_team, away_team, match_info, match_score, match_bet, matchesArr) {
    let games = document.getElementById(posName)

    let init = document.createElement('div');
    init.id = gameID;
    init.classList.add("fixture");
    if (canBet(new Date(match_info))) {
        init.onclick = function (event) {
            document.getElementById("empty").classList.add('empty'); //change background opacity

            var home = document.getElementById(gameID).children[0].children[0].children[1].children[0].innerHTML;
            var homeImg = document.getElementById(gameID).children[0].children[0].children[0].children[0].src;
            var away = document.getElementById(gameID).children[0].children[2].children[1].children[0].innerHTML;
            var awayImg = document.getElementById(gameID).children[0].children[2].children[0].children[0].src;
            var info = document.getElementById(gameID).children[0].children[1].children[0].innerHTML;
            console.log("Info: ", info);

            document.getElementById("home_team_popup").innerHTML = home;
            document.getElementById("home_img_popup").src = homeImg;
            document.getElementById("away_team_popup").innerHTML = away;
            document.getElementById("away_img_popup").src = awayImg;
            document.getElementById("info_popup").innerHTML = info;

            if (match_bet != "") {
                var bet = document.getElementById(gameID).children[0].children[1].children[3].innerHTML;

                document.getElementById("home_score_popup").value = bet.split("-")[0];
                document.getElementById("away_score_popup").value = bet.split("-")[1];
            }

            document.querySelector(".popup").style.display = "block"; //show game
        }
    }

    let scoreboar = document.createElement('div');
    scoreboar.classList.add("score-board");

    //Home____________________________________________
    let home = document.createElement('div');
    home.classList.add("home");

    let imgDivHome = document.createElement('div');
    let imgHome = document.createElement('img');
    imgHome.classList.add("team-img");
    imgHome.src = "images/Countries/" + home_team + ".png";
    imgDivHome.appendChild(imgHome);
    let nameDivHome = document.createElement('div');
    let nameHome = document.createElement('span');
    nameHome.id = "home_team";
    nameHome.innerHTML = home_team;
    nameDivHome.appendChild(nameHome);

    home.appendChild(imgDivHome);
    home.appendChild(nameDivHome);


    //Match info____________________________________________
    let matchDiv = document.createElement('div');
    matchDiv.id = "info";

    let info = document.createElement('div');
    info.classList.add("match-info")
    //console.log("Mach info: ", match_info);
    info.innerHTML = dateToString(match_info);
    matchDiv.appendChild(info);
    let score = document.createElement('div');
    score.classList.add("score");
    //console.log("match_score:", match_score)
    match_score != "" ? score.innerHTML = match_score : score.style.display = "none";
    score.innerHTML = match_score;
    matchDiv.appendChild(score);
    let betTitle = document.createElement('div');
    betTitle.classList.add("match-info");
    betTitle.innerHTML = "APOSTA";
    matchDiv.appendChild(betTitle);
    let bet = document.createElement('div');
    bet.style = "text-align: center;"
    bet.style.textShadow = "1px 1px #0000";
    // console.log(match_bet);
    if (match_bet != "") {
        bet.innerHTML = match_bet;
        //changeBetColor(match_score, bet);
    }
    else {
        bet.style.display = "none";
        betTitle.style.display = "none";
    }
    // match_bet != "" ? bet.innerHTML = match_bet : bet.style.display = "none", betTitle.style.display = "none";
    //bet.innerHTML = match_bet;
    matchDiv.appendChild(bet);

    //Away____________________________________________
    let away = document.createElement('div');
    away.classList.add("away");

    let imgDivAway = document.createElement('div');
    let imgAway = document.createElement('img');
    imgAway.classList.add("team-img");
    imgAway.src = "images/Countries/" + away_team + ".png";
    imgDivAway.appendChild(imgAway);
    let nameDivAway = document.createElement('div');
    let nameAway = document.createElement('span');
    nameAway.id = "away_team";
    nameAway.innerHTML = away_team;
    nameDivAway.appendChild(nameAway);

    away.appendChild(imgDivAway);
    away.appendChild(nameDivAway);


    scoreboar.appendChild(home);
    scoreboar.appendChild(matchDiv);
    scoreboar.appendChild(away);
    init.appendChild(scoreboar);
    games.appendChild(init);

    //Separator
    let gameNumber = parseInt(gameID.replace(/^\D+/g, ''));
    let gamesLength = Object.keys(matchesArr).length;
    if (gameNumber < gamesLength - 1) {
        let separator = document.createElement('hr');
        games.appendChild(separator);
    }
}

function newMatch1(gameID, home_team, away_team, match_info, match_score, match_bet, matchesArr) {
    let games = document.getElementById("games_A")

    let init = document.createElement('div');
    init.id = gameID;
    init.classList.add("fixture");
    let scoreboar = document.createElement('div');
    scoreboar.classList.add("score-board");

    //Home____________________________________________
    let home = document.createElement('div');
    home.classList.add("home");

    let imgDivHome = document.createElement('div');
    let imgHome = document.createElement('img');
    imgHome.classList.add("team-img");
    imgHome.src = "images/Countries/" + home_team + ".png";
    imgDivHome.appendChild(imgHome);
    let nameDivHome = document.createElement('div');
    let nameHome = document.createElement('span');
    nameHome.id = "home_team";
    nameHome.innerHTML = home_team;
    nameDivHome.appendChild(nameHome);

    home.appendChild(imgDivHome);
    home.appendChild(nameDivHome);


    //Match info____________________________________________
    let matchDiv = document.createElement('div');
    matchDiv.id = "info";

    let info = document.createElement('div');
    info.classList.add("match-info")
    //console.log("Mach info: ", match_info);
    info.innerHTML = dateToString(match_info);
    matchDiv.appendChild(info);
    let score = document.createElement('div');
    score.classList.add("score");
    //console.log("match_score:", match_score)
    match_score != "" ? score.innerHTML = match_score : score.style.display = "none";
    score.innerHTML = match_score;
    matchDiv.appendChild(score);
    let betTitle = document.createElement('div');
    betTitle.classList.add("match-info");
    betTitle.innerHTML = "APOSTA";
    matchDiv.appendChild(betTitle);
    let bet = document.createElement('div');
    bet.style = "text-align: center;"
    bet.style.textShadow = "1px 1px #0000";
    // bet.innerHTML = match_bet;
    match_bet != "" ? bet.innerHTML = match_bet : bet.innerHTML = "-";

    matchDiv.appendChild(bet);

    //Away____________________________________________
    let away = document.createElement('div');
    away.classList.add("away");

    let imgDivAway = document.createElement('div');
    let imgAway = document.createElement('img');
    imgAway.classList.add("team-img");
    imgAway.src = "images/Countries/" + away_team + ".png";
    imgDivAway.appendChild(imgAway);
    let nameDivAway = document.createElement('div');
    let nameAway = document.createElement('span');
    nameAway.id = "away_team";
    nameAway.innerHTML = away_team;
    nameDivAway.appendChild(nameAway);

    away.appendChild(imgDivAway);
    away.appendChild(nameDivAway);


    scoreboar.appendChild(home);
    scoreboar.appendChild(matchDiv);
    scoreboar.appendChild(away);
    init.appendChild(scoreboar);
    games.appendChild(init);

    //Separator
    let gameNumber = parseInt(gameID.replace(/^\D+/g, ''));
    let gamesLength = Object.keys(matchesArr).length;
    if (gameNumber < gamesLength - 1) {
        let separator = document.createElement('hr');
        games.appendChild(separator);
    }
}

//Not beeing used
function changeBetColor(score, elem_bet) {
    bet = elem_bet.innerHTML;
    if (score != "" && bet != "") {
        var x = bet.split("-")[0];
        var y = bet.split("-")[1];
        var sx = score.split("-")[0];
        var sy = score.split("-")[1];

        if (x == sx && y == sy) {
            elem_bet.style.color = "#05b534"; //05b534
        }
        else if (Math.abs(x - y) == Math.abs(sx - sy)) {
            elem_bet.style.color = "#f5ee2f";
        }
        //TODO
        else if ("TODO" == "") {
            elem_bet.style.color = "#e88133";
        }
        else {
            elem_bet.style.color = "#e83333";
        }
    }
}


/**
 * This method creates, acording to the date of the game,
 * a date string to be displayed to the user
 *
 * @param {*} sMachInfo
 */
function dateToString(sMachInfo) {
    let monthsAbr = ["Jan", "Fev", "Mar", "Abr", "Maio", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dez"];
    let weekDaysAbr = ["Dom", "Seg", "Terç", "Qua", "Qui", "Sex", "Sáb"];
    let dateVar = new Date(sMachInfo);

    let date = sMachInfo.split("T")[0];
    let weekDay = weekDaysAbr[dateVar.getDay()];
    let day = date.split("-")[2];
    let month = monthsAbr[date.split("-")[1] - 1];
    let time = sMachInfo.split("T")[1];

    return month + " " + day + " (" + weekDay + ") " + time;
}

/**
 * This method checks whether a player can bet / change bets
 * or not
 *
 * @param {*} gameDate
 */
function canBet(gameDate) {
    let todaysDate = new Date();
    let diffInMs = (gameDate - todaysDate) / (1000 * 60);
    console.log("Min: ", diffInMs);
    return diffInMs > 60 ? true : false;
}


/**
 * This method return the players bet in case he made one
 * or not
 *
 * @param {*} arrBets    //all bets of the game
 * @param {*} playerName
 */
function getPlayerBet(arrBets, playerName) {
    for (key in arrBets) {
        if (key == playerName)
            return arrBets[key];
    }
    return ""
}

/**
 * This method registers new user in the firebase DataBase
 *
 */
function registerUser() {
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    //hide login and error_msg btn and show loader
    document.getElementById('registerForm').style.display = "none";
    document.getElementById('loader').style.display = "flex";
    document.getElementById('error_msg').innerHTML = "";

    db.ref('Users').once("value", function (snapshot) {
        var user = snapshot.val();
        var valid = true;
        for (let u in user) {
            if (u === username) {
                valid = false;
                break;
            }
        }

        if (valid) {
            auth.createUserWithEmailAndPassword(email, password)
                .then(function () {
                    let user = auth.currentUser;

                    db.ref('Users/' + username).set({
                        email: email,
                        points: 0,
                        bets: { "GameRef": "bet" }
                    })

                    window.location.href = "index.html";
                })
                .catch(function (error) {
                    let error_code = error.code;
                    let error_msg = error.message;

                    //hide loader and show login btn
                    document.getElementById('registerForm').style.display = "block";
                    document.getElementById('loader').style.display = "none";

                    document.getElementById('error_msg').innerHTML = error_msg;
                    // alert(error_msg);
                });
        }
        else {
            document.getElementById('error_msg').innerHTML = "Username already exist";
            //hide loader and show login btn
            document.getElementById('registerForm').style.display = "block";
            document.getElementById('loader').style.display = "none";
        }
    });

}

/**
 * This method is responsible for the login of user
 *
 */
function loginUser() {
    let user = document.getElementById('user').value;
    let password = document.getElementById('password').value;

    //hide login and error_msg btn and show loader
    document.getElementById('loginForm').style.display = "none";
    document.getElementById('loader').style.display = "flex";
    document.getElementById('error_msg').innerHTML = "";

    if (user.includes("@")) {
        var email = user;
        console.log(email)
        auth.signInWithEmailAndPassword(email, password)
            .then(function () {
                let player = auth.currentUser;
                let playerEmail = player.email;

                db.ref('Users').once("value", function (snapshot) {
                    var users = snapshot.val();
                    for (let u in users) {
                        db.ref('Users').child(u).once("value", function (snapshot) {
                            var user = snapshot.val();

                            // console.log("   ", user.email, playerEmail)
                            if (user.email == playerEmail) {
                                // console.log("DEU: email")
                                localStorage.setItem("username", u);

                                window.location.href = "home.html";
                            }
                        });
                    }
                });
            })
            .catch(function (error) {
                let error_code = error.code;
                let error_msg = error.message;

                //hide loader and show login btn
                document.getElementById('loginForm').style.display = "block";
                document.getElementById('loader').style.display = "none";

                document.getElementById('error_msg').innerHTML = error_msg;

                // alert(error_msg);

            });
    }
    else {
        var username = user;
        db.ref('Users/' + username).once("value", function (snapshot) {
            var user = snapshot.val();
            console.log(user)
            if (user == null) {
                document.getElementById('error_msg').innerHTML = "Username dosen't exist";
                //hide loader and show login btn
                document.getElementById('loginForm').style.display = "block";
                document.getElementById('loader').style.display = "none";
            }
            else {
                auth.signInWithEmailAndPassword(user.email, password)
                    .then(function () {
                        let player = auth.currentUser;
                        let playerEmail = player.email;

                        db.ref('Users').once("value", function (snapshot) {
                            var users = snapshot.val();
                            for (let u in users) {
                                db.ref('Users').child(u).once("value", function (snapshot) {
                                    var user = snapshot.val();

                                    // console.log("   ", user.email, playerEmail)
                                    if (user.email == playerEmail) {
                                        localStorage.setItem("username", u);
                                        console.log("DEU: username")

                                        console.log(localStorage.getItem("username"))
                                        window.location.href = "home.html";
                                    }
                                });
                            }
                        });
                    })
                    .catch(function (error) {
                        let error_code = error.code;
                        let error_msg = error.message;

                        //hide loader and show login btn
                        document.getElementById('loginForm').style.display = "block";
                        document.getElementById('loader').style.display = "none";

                        document.getElementById('error_msg').innerHTML = error_msg;


                        // alert(error_msg);
                    });
            }
        });
    }
}

/**
 * This method is responsible for the logout of user
 *
 */
function logOut() {
    auth.signOut()
        .then(function () {
            localStorage.clear();
            window.location.href = "index.html";
        }, function (error) {
            console.error('Sign Out Error', error);
        });
}

/**
 * This method checks wheter a user is already connected or not, redirecting those
 * who are not connected to the login page
 *
 */
function checkAuthorisation() {
    auth.onAuthStateChanged(function (user) {
        // console.log(user);
        if (!user) {
            window.location.href = "index.html";
        }
    });
}


