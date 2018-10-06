function App(){
	let app = this;
	this.veep = "R";

	function Helper(){
		this.lsSetObject = function(key,value){
			localStorage.setItem(key, JSON.stringify(value));
		};
		this.lsGetObject = function(key){
			let value = localStorage.getItem(key);
			return value && JSON.parse(value);
		}
		this.queryFormat = function(class_,axis,index){
			return document.querySelector("."+class_+"[axis=\""+axis+"\"][index=\""+index+"\"]")
		}
		this.xhrPromise = function(url,async) {
			let p = new Promise(
				(resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.open("GET", url, async);
					xhr.onload = () => resolve(xhr);
					xhr.onerror = () => reject(xhr);
					xhr.send();
				}
			);
			return p;
		};
	}

	function SenateSeat(key,data){
		let seat = this;
		this.key = key;
		this.state = data.state;
		this.class = data.class;
		this.incumbent = data.incumbent;
		this.previous_incumbent = data.incumbent;
		this.previous_election = data.previous_election;
		this.election = data.election;
		this.click = function(e){
			e.stopPropagation();
			if (e.shiftKey){
				seat.setAttribute("axis",seat.axis == "demgop" ? "greenlib" : "demgop");
			} else {
				if ((e.which == 1 && e.ctrlKey) || e.which == 3){
					delta = seat.index < 6 ? 1 : 0;
				} else if (e.which == 1){
					delta = seat.index > 0 ? -1 : 0;
				}
				seat.setAttribute("index",seat.index + delta);
			}
			app.scoreboard.adjust();
		}
		this.setListener = function(){
			seat.element = document.getElementById(seat.key);
			seat.element.addEventListener("mousedown",seat.click);
		}
		this.setAttribute = function(attr,value,set_local){
			if (attr == "axis" || attr == "index"){
				seat[attr] = value;
				seat.setParty();
				if (set_local !== false){
					seat.setLocal();
				}
				seat.element.setAttribute(attr,seat[attr]);
			}
		}
		this.setParty = function(party){
			if (party == undefined){
				if (seat.axis == "demgop"){
					seat.party = ["D","D","D",null,"R","R","R"][seat.index]
				} else {
					seat.party = ["G","G","G",null,"L","L","L"][seat.index]
				}
			} else {
				seat.party = party;
			}
		}
		this.getLocal = function(){
			cache = app.helper.lsGetObject("senate_seats")
			if (cache !== null && cache.hasOwnProperty(seat.key)){
				let [axis, index] = cache[seat.key]
				seat.setAttribute("axis",axis,false);
				seat.setAttribute("index",index,false);
			} else {
				seat.setAttribute("axis","demgop",false);
				seat.setAttribute("index",3,false);
			}
		}
		this.setLocal = function(){
			let cache = app.helper.lsGetObject("senate_seats")
			if (cache == null){
				cache = {}
			}
			cache[seat.key] = [seat.axis,seat.index];
			app.helper.lsSetObject("senate_seats",cache)
		}
		this.removeLocal = function(){
			let cache = app.helper.lsGetObject("senate_seats");
			if (cache !== null){
				if (cache.hasOwnProperty(seat.key)){
					delete cache[seat.key];
					app.helper.lsSetObject("senate_seats",cache)
				}
			}
		}
		this.show = function(){
			seat.element.classList.remove("NOELECTION");
			seat.label.classList.remove("NOELECTION-LABEL");
			seat.setAttribute("axis","demgop",false);
			seat.setAttribute("index",3,false);
			console.log(seat.element);
		}
		this.hide = function(){
			seat.element.classList.add("NOELECTION");
			seat.label.classList.add("NOELECTION-LABEL");
			seat.removeLocal();
		}
		this.reset = function(){
			seat.setAttribute("axis","demgop");
			seat.setAttribute("index",3);
		}
		this.previousResult = function(){
			let election;
			if (seat.incumbent == seat.previous_incumbent){
				election = seat.previous_election;
			} else {
				election = seat.election;
			}
			let party;
			let votes = 0;
			let runnerup = 0;
			for (let i=0; i<election.candidates.length; i++){
				
				let candidate = election.candidates[i];
				if (candidate.votes > votes){
					runnerup = Math.max(runnerup,votes);
					votes = candidate.votes;
					party = candidate.caucus;
				} else {
					runnerup = Math.max(runnerup,candidate.votes);
				}
			}
			seat.setDelta(party,(votes-runnerup)/election.total_votes);	
		}
		this.setDelta = function(party,delta,breakpoints){
			if (breakpoints == undefined){
				breakpoints = [0,0.05,0.1]
			}
			let strength;
			if (delta <= breakpoints[0]){
				strength = 0;
			} else if (delta <= breakpoints[1]){
				strength = 1;
			} else if (delta <= breakpoints[2]){
				strength = 2;
			} else {
				strength = 3;
			}
			seat.setAttribute("axis","demgop");
			if (party == "D" || party == "G"){
				seat.setAttribute("index",3-strength);
			} else {
				seat.setAttribute("index",3+strength);
			}
		}
		this.initElement = function(){
			this.element = document.getElementById(seat.key);
			this.label = document.getElementById("label"+seat.key)
			this.getLocal();
		}
		this.setListener();
		this.initElement();
	}
	function Scoreboard(nocontest){
		let scoreboard = this;
		for (let prop of ["D","R","L","G"]){
			if (!nocontest.hasOwnProperty(prop)){
				nocontest[prop] = 0;
			}
		}
		this.text = {
			"R":{
				"gain":document.getElementById("gopgain"),
				"score":document.getElementById("gopscore"),
				"caucus":document.getElementById("gopcaucus")
			},
			"D":{
				"gain":document.getElementById("demgain"),
				"score":document.getElementById("demscore"),
				"caucus":document.getElementById("demcaucus")
			},
			"VP":document.getElementById("veep")
		}
		this.nocontest = nocontest;
		this.adjust = function(){
			let counts = {
				"demgop":[0,0,0,0,0,0,0],
				"greenlib":[0,0,0,0,0,0,0],
			};
			let gains = {"D":0,"R":0,"G":0,"L":0}
			let totals = {}
			for (let prop in gains){
				totals[prop] = nocontest[prop];
			}
			for (let key in app.seats){
				let seat = app.seats[key];
				counts[seat.axis][seat.index] += 1;
				
				gains[seat.incumbent.caucus] -= 1
				if (seat.party !== null){
					totals[seat.party] += 1;
					gains[seat.party] += 1;
				}
			}
			document.querySelectorAll(".scoretext").forEach(function(elem){
				elem.innerHTML = "";
			});
			document.querySelectorAll(".caucusbar").forEach(function(elem){
				elem.innerHTML = "";
			});
			
			for (let axis in counts){
				for (let i=0; i<counts[axis].length; i++){
					let elem = app.helper.queryFormat("partybar",axis,i);
					if (elem !== null && counts[axis][i]>0){
						elem.setAttribute("style","width:calc("+counts[axis][i].toString()+"% / 1.00);display:inline-block;")
					} else if (elem !== null){
						elem.setAttribute("style","display:none;")
					}
				}
				let safeD = app.helper.queryFormat("partybar","demgop",-1);
				if (safeD !== null && nocontest.D>0){
					safeD.setAttribute("style","width:calc("+nocontest.D.toString()+"% / 1.00);display:inline-block;")
				} else if (safeD !== null){
					safeD.setAttribute("style","display:none;")
				}
				let safeR = app.helper.queryFormat("partybar","demgop",7);
				if (safeR !== null && nocontest.R>0){
					safeR.setAttribute("style","width:calc("+nocontest.R.toString()+"% / 1.00);display:inline-block;")
				} else if (safeR !== null){
					safeR.setAttribute("style","display:none;")
				}
			}
			for (let party of ["D","R","G","L"]){
				if (totals[party] == 50 && app.veep == party){
					if (app.veep == "R"){
						this.text.R.caucus.innerText = "MAJORITY";
						this.text.VP.classList.remove("DEM3-text");
						this.text.VP.classList.add("GOP3-text");
					} else {
						this.text.D.caucus.innerText = "MAJORITY";
						this.text.VP.classList.remove("GOP3-text");
						this.text.VP.classList.add("DEM3-text");
					}
					this.text.VP.innerHTML = "VP";
				}
			};
			if (totals.D > 50){
				this.text.D.caucus.innerText = "MAJORITY";
			};
			if (totals.R > 50){
				this.text.R.caucus.innerText = "MAJORITY";
			};
			let gaintext = {};
			for (let party in gains){
				let delta = gains[party]
				gaintext[party] = delta > 0 ? "+"+delta.toString() : delta < 0 ? delta.toString() : "--"
			}
			this.text.D.gain.innerHTML = gaintext.D;
			this.text.R.gain.innerHTML = gaintext.R;
			
			if (totals.G>0){
				this.text.D.score.innerHTML = "DEM "+totals.D.toString() + " / GRN "+totals.G.toString();
			} else {
				this.text.D.score.innerHTML = "DEM "+totals.D.toString();
			}
			if (totals.L>0){
				this.text.R.score.innerHTML = totals.L.toString() + " LIB / "+totals.R.toString()+" GOP";
			} else {
				this.text.R.score.innerHTML = totals.R.toString()+" GOP";
			}
		}
	}
	function Forecast(){
		let forecast = this;
		this.cache = {}
		this.fiveThirtyEight = function(){
			
			let callback = function(xhr,type){
				let data;
				if (type == "json"){
					data = xhr;
				} else {
					data = JSON.parse(xhr.responseText);
					forecast.cache['538'] = data;
				}
				for (let i=0;i<data.seatForecasts.length;i++){
					let seatForecast = data.seatForecasts[i].forecast;
					if (data.seatForecasts[i].state == "US"){
						continue;
					}
					let classRoman = data.seatForecasts[i].class == 1 ? "I" : "II";
					let key = data.seatForecasts[i].state + "-" + classRoman;
					let party;
					let winprob = 0;
					let winprobs = {};
					for (let j=0; j<seatForecast.length;j++){
						let candidate = seatForecast[j];
						if (candidate.models.classic.winprob > winprob){
							winprob = candidate.models.classic.winprob;
							party = candidate.party === "I" ? "D" : candidate.party;
						}
						let party_ = candidate.party === "I" ? "D" : candidate.party;
						if (!winprobs.hasOwnProperty(party_)){
							winprobs[party_] = 0;
						}
						winprobs[party_] += candidate.models.classic.winprob;
					}
					app.seats[key].setDelta(party,winprob,[60,75,90]);
					
				}
				app.scoreboard.adjust();
			}
			if (forecast.cache.hasOwnProperty('538')){
				callback(forecast.cache['538'],"json");
			} else {
				let url = "https://projects.fivethirtyeight.com/2018-midterm-election-forecast/senate/home.json"
				app.helper.xhrPromise(url).then(callback);
			}
		}
		this.sabato = function(){
			let keymap = {"Arizona":"AZ-I","California":"CA-I","Connecticut":"CT-I","Delaware":"DE-I","Florida":"FL-I","Hawaii":"HI-I","Indiana":"IN-I","Maine":"ME-I","Maryland":"MD-I","Massachusetts":"MA-I","Michigan":"MI-I","Minnesota":"MN-I","Minnesota (S)":"MN-II","Mississippi":"MS-I","Mississippi (S)":"MS-II","Missouri":"MO-I","Montana":"MT-I","Nebraska":"NE-I","Nevada":"NV-I","New Jersey":"NJ-I","New Mexico":"NM-I","New York":"NY-I","North Dakota":"ND-I","Ohio":"OH-I","Pennsylvania":"PA-I","Rhode Island":"RI-I","Tennessee":"TN-I","Texas":"TX-I","Utah":"UT-I","Vermont":"VT-I","Virginia":"VA-I","Washington":"WA-I","West Virginia":"WV-I","Wisconsin":"WI-I","Wyoming":"WY-I"};
			let callback = function(xhr,type){
				let data;
				if (type == "doc"){
					data = xhr;
				} else {
					data = document.createElement( 'html' );
					data.innerHTML = xhr.responseText;
					forecast.cache['Sabato'] = data;
				}
				let trs = data.querySelectorAll("tr");
				for (let i=3;i<trs.length-3;i++){
					let tr = trs[i];
					if (tr.querySelector("td")== null){
						continue;
					}
					let tds = tr.querySelectorAll("td")
					let key = keymap[tds[0].textContent];
					let seat = app.seats[key];
					let index = parseInt(tds[6].textContent)-1;
					seat.setAttribute("axis","demgop")
					seat.setAttribute("index",index);
				}
				app.scoreboard.adjust();
			}
			if (forecast.cache.hasOwnProperty('Sabato')){
				callback(forecast.cache['Sabato'],"doc");
			} else {
				let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4KY7cdB2oiA8_Qlfjuei0O9LkApgXMnyUm4pcW2KR5pKsTRcEcnC-UoSB8LfqljT1ktFI5e9CPJUn/pubhtml/sheet?headers=false&gid=0"
				app.helper.xhrPromise(url).then(callback);
			}
		}
		this.cnn = function(){
			let keymap = {"Open, Flake (R)":"AZ-I","Feinstein (D)":"CA-I","Murphy (D)":"CT-I","Carper (D)":"DE-I","Nelson (D)":"FL-I","Hirono (D)":"HI-I","Donnelly (D)":"IN-I","Warren (D)":"MA-I","Cardin (D)":"MD-I","King (I)":"ME-I","Stabenow (D)":"MI-I","Klobuchar (D)":"MN-I","Smith (D)":"MN-II","McCaskill (D)":"MO-I","Hyde-Smith (R)":"MS-II","Wicker (R)":"MS-I","Tester (D)":"MT-I","Heitkamp (D)":"ND-I","Fischer (R)":"NE-I","Menéndez (D)":"NJ-I","Heinrich (D)":"NM-I","Heller (R)":"NV-I","Gillibrand (D)":"NY-I","Brown (D)":"OH-I","Casey (D)":"PA-I","Whitehouse (D)":"RI-I","Open, Corker (R)":"TN-I","Cruz (R)":"TX-I","Open, Hatch (R)":"UT-I","Kaine (D)":"VA-I","Sanders (I)":"VT-I","Cantwell (D)":"WA-I","Baldwin (D)":"WI-I","Manchin (D)":"WV-I","Barrasso (R)":"WY-I"}
			let callback = function(xhr,type){
				let data;
				if (type == "json"){
					data = xhr;
				} else {
					data = JSON.parse(xhr.responseText);
					forecast.cache['cnn'] = data;
				}
				let collections = data.collections;
				for (let i=0; i<collections.length; i++){
					for (let j=0; j<collections[i].length;j++){
						let race = collections[i][j];
						let key = keymap[race.displayName];
						if (!app.seats.hasOwnProperty(key)){
							continue;
						}
						let seat = app.seats[key];
						seat.setAttribute("axis","demgop");
						seat.setAttribute("index",parseInt(race.status)+3)
						
						
					}
				}
				app.scoreboard.adjust();
			}
			if (forecast.cache.hasOwnProperty('cnn')){
				callback(forecast.cache['cnn'],"json");
			} else {
				let url = "https://politics-static.cnn.io/key-races/senate-seat-stage.json"
				app.helper.xhrPromise(url).then(callback);
			}
		}
		this.politico = function(){
			let keymap = {"AL-sen": "AL-I", "AZ-sen": "AZ-I", "CA-sen": "CA-I", "CT-sen": "CT-I", "DE-sen": "DE-I", "FL-sen": "FL-I", "HI-sen": "HI-I", "IN-sen": "IN-I", "MA-sen": "MA-I", "MD-sen": "MD-I", "ME-sen": "ME-I", "MI-sen": "MI-I", "MN-sen": "MN-I", "MN-sen-special": "MN-II", "MO-sen": "MO-I", "MS-sen": "MS-I", "MS-sen-special": "MS-II", "MT-sen": "MT-I", "ND-sen": "ND-I", "NE-sen": "NE-I", "NJ-sen": "NJ-I", "NM-sen": "NM-I", "NV-sen": "NV-I", "NY-sen": "NY-I", "OH-sen": "OH-I", "PA-sen": "PA-I", "RI-sen": "RI-I", "TN-sen": "TN-I", "TX-sen": "TX-I", "UT-sen": "UT-I", "VA-sen": "VA-I", "VT-sen": "VT-I", "WA-sen": "WA-I", "WI-sen": "WI-I", "WV-sen": "WV-I", "WY-sen": "WY-I"}
			let callback = function(xhr,type){
				let data;
				if (type == "json"){
					data = xhr;
				} else {
					data = JSON.parse(xhr.responseText);
					forecast.cache['politico'] = data;
				}
				for (let i=0; i<data.length; i++){
					if (!keymap.hasOwnProperty(data[i].id)){
						continue;
					}
					let key = keymap[data[i].id];
					
					let seat = app.seats[key];
					seat.setAttribute("axis","demgop");
					seat.setAttribute("index",data[i].latest_rating.id-1)
				}
				
				app.scoreboard.adjust();
			}
			if (forecast.cache.hasOwnProperty('politico')){
				callback(forecast.cache['politico'],"json");
			} else {
				let url = "https://www.politico.com/election-results/2018/race-ratings/data/ratings.json?format=json"
				app.helper.xhrPromise(url).then(callback);
			}
		}
	}
	function toggleSpecial(on,scenario){
		if (on==true){
			for (let key in app.special){
				if (!app.seats.hasOwnProperty(key)){
					let seat = app.special[key];
					app.seats[key] = seat;
					seat.show();
					app.scoreboard.nocontest[seat.incumbent.caucus] -= 1;
					seat.incumbent = seat.previous_incumbent;
				}
			}
		} else if (on==false){
			for (let key in app.special){
				let seat = app.special[key];
				if (app.seats.hasOwnProperty(key)){
					delete app.seats[key];
					seat.hide();
					app.scoreboard.nocontest[seat.incumbent.caucus] += 1;
				}
				if (scenario=="post-election"){
					app.scoreboard.nocontest[seat.incumbent.caucus] -= 1;
					seat.incumbent = seat.election.winner;
					app.scoreboard.nocontest[seat.incumbent.caucus] += 1;
				} else if (scenario=="pre-election"){
					app.scoreboard.nocontest[seat.incumbent.caucus] -= 1;
					seat.incumbent = seat.previous_incumbent;
					app.scoreboard.nocontest[seat.incumbent.caucus] += 1;
				}
			}
		}
		app.scoreboard.adjust();
	}
	function selectSpecial(scenario){
		if (scenario=="pre-election"){
			toggleSpecial(false,scenario);
		} else if (scenario=="election") {
			toggleSpecial(true,scenario);
		} else {
			scenario = "post-election";
			toggleSpecial(false,scenario);
		}
		localStorage.setItem("showSpecial",scenario);
	}
	
	this.helper = new Helper()
	let elections;
	let senate;
	let promises = [];
	this.forecast = new Forecast();
	
	promises.push(this.helper.xhrPromise('./svg/map.svg',false).then(function(xhr){
		document.getElementById("svgContainer").appendChild(xhr.responseXML.documentElement);
	}));
	promises.push(this.helper.xhrPromise('./json/elections.json').then(function(xhr){
		elections = JSON.parse(xhr.responseText);
	}));
	promises.push(this.helper.xhrPromise('./json/senate.json').then(function(xhr){
		senate = JSON.parse(xhr.responseText);
	}));
	Promise.all(promises).then(function(values){
		app.seats = {}
		app.special = {};
		let nocontest = {"D":0,"R":0};
		
		for (let key in senate){
			if (elections.hasOwnProperty(key)){
				let seat = new SenateSeat(key,elections[key]);
				if (elections[key].election.special == "Mid-cycle"){
					app.special[key] = seat;
				}
				app.seats[key] = seat;
				
			} else {
				let party = senate[key].caucus;
				nocontest[party] ++;
			}
		}
		app.scoreboard = new Scoreboard(nocontest);
		app.showSpecial = localStorage.getItem("showSpecial");
		if (app.showSpecial === null){
			app.showSpecial = "post-election";
		}
		selectSpecial(app.showSpecial);
		document.getElementById("previous_results_btn").addEventListener("click",function(e){
			e.preventDefault();
			for (let key in app.seats){
				app.seats[key].previousResult();
			}
			app.scoreboard.adjust();
		});
		document.getElementById("538_btn").addEventListener("click",function(e){
			e.preventDefault();
			app.forecast.fiveThirtyEight();
		});
		document.getElementById("sabato_btn").addEventListener("click",function(e){
			e.preventDefault();
			app.forecast.sabato();
		});
		document.getElementById("cnn_btn").addEventListener("click",function(e){
			e.preventDefault();
			app.forecast.cnn();
		});
		document.getElementById("politico_btn").addEventListener("click",function(e){
			e.preventDefault();
			app.forecast.politico();
		});
		document.getElementById("reset_btn").addEventListener("click",function(e){
			e.preventDefault();
			for (let key in app.seats){
				app.seats[key].reset();
			}
			app.scoreboard.adjust();
		});
		app.scoreboard.adjust();
	});
}