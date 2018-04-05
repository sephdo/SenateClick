//dark red to dark blue
//DEM3 previously #179ee0
/*var party_colors = [
{party:"DEM3",color:"#40c0ff"},
{party:"DEM2",color:"#80d5ff"},
{party:"DEM1",color:"#a6e2ff"},
{party:"SWING",color:"#D3D3D3"},
{party:"GOP1",color:"#ffc9bf"},
{party:"GOP2",color:"#ff9380"},
{party:"GOP3",color:"#ff5d40"}
]
var demgop_colors = [
{party:"DEM3",color:"#0096e0"},
{party:"DEM2",color:"#43ace0"},
{party:"DEM1",color:"#86c2e0"},
{party:"SWING",color:"#cccccc"},
{party:"GOP1",color:"#ffc9bf"},
{party:"GOP2",color:"#ff9380"},
{party:"GOP3",color:"#ff5d40"}
]

HSV = 9 65 100
*/
var demgop_colors = [
{party:"DEM3",color:"#19b3ff"},
{party:"DEM2",color:"#59c8ff"},
{party:"DEM1",color:"#99ddff"},
{party:"SWING",color:"#cccccc"},
{party:"GOP1",color:"#ffa999"},
{party:"GOP2",color:"#ff7359"},
{party:"GOP3",color:"#ff3d19"}
]
var greenlib_colors = [
{party:"GREEN3",color:"#19ff19"},
{party:"GREEN2",color:"#59ff59"},
{party:"GREEN1",color:"#99ff99"},
{party:"SWING",color:"#cccccc"},
{party:"LIB1",color:"#ffef99"},
{party:"LIB2",color:"#ffe659"},
{party:"LIB3",color:"#ffdc19"}
]
var all_colors = {
GREEN3:"#19ff19",
GREEN2:"#59ff59",
GREEN1:"#99ff99",
SWING:"#cccccc",
LIB1:"#ffef99",
LIB2:"#ffe659",
LIB3:"#ffdc19",
DEM1:"#99ddff",
DEM2:"#59c8ff",
DEM3:"#19b3ff",
GOP1:"#ffa999",
GOP2:"#ff7359",
GOP3:"#ff3d19",
}

var scoreboard = [
	{party:"DEM1",score:0},
	{party:"DEM2",score:0},
	{party:"DEM3",score:0},
	{party:"GOP1",score:0},
	{party:"GOP2",score:0},
	{party:"GOP3",score:0},
	{party:"GREEN1",score:0},
	{party:"GREEN2",score:0},
	{party:"GREEN3",score:0},
	{party:"LIB1",score:0},
	{party:"LIB2",score:0},
	{party:"LIB3",score:0},
	{party:"SWING",score:538},
]

var ev_arr = [
{state:"AL", fullstate:"Alabama", ev:9, party:"SWING", index:"00", axis:"demgop"},
{state:"AK", fullstate:"Alaska", ev:3, party:"SWING", index:"01", axis:"demgop"},
{state:"AZ", fullstate:"Arizona", ev:11, party:"SWING", index:"02", axis:"demgop"},
{state:"AR", fullstate:"Arkansas", ev:6, party:"SWING", index:"03", axis:"demgop"},
{state:"CA", fullstate:"California", ev:55, party:"SWING", index:"04", axis:"demgop"},
{state:"CO", fullstate:"Colorado", ev:9, party:"SWING", index:"05", axis:"demgop"},
{state:"CT", fullstate:"Connecticut", ev:7, party:"SWING", index:"06", axis:"demgop"},
{state:"DE", fullstate:"Delaware", ev:3, party:"SWING", index:"07", axis:"demgop"},
{state:"FL", fullstate:"Florida", ev:29, party:"SWING", index:"08", axis:"demgop"},
{state:"GA", fullstate:"Georgia", ev:16, party:"SWING", index:"09", axis:"demgop"},
{state:"HI", fullstate:"Hawaii", ev:4, party:"SWING", index:"10", axis:"demgop"},
{state:"ID", fullstate:"Idaho", ev:4, party:"SWING", index:"11", axis:"demgop"},
{state:"IL", fullstate:"Illinois", ev:20, party:"SWING", index:"12", axis:"demgop"},
{state:"IN", fullstate:"Indiana", ev:11, party:"SWING", index:"13", axis:"demgop"},
{state:"IA", fullstate:"Iowa", ev:6, party:"SWING", index:"14", axis:"demgop"},
{state:"KS", fullstate:"Kansas", ev:6, party:"SWING", index:"15", axis:"demgop"},
{state:"KY", fullstate:"Kentucky", ev:8, party:"SWING", index:"16", axis:"demgop"},
{state:"LA", fullstate:"Louisiana", ev:8, party:"SWING", index:"17", axis:"demgop"},
{state:"ME", fullstate:"Maine", ev:4, party:"SWING", index:"18", axis:"demgop"},
{state:"MD", fullstate:"Maryland", ev:10, party:"SWING", index:"19", axis:"demgop"},
{state:"MA", fullstate:"Massachusetts", ev:11, party:"SWING", index:"20", axis:"demgop"},
{state:"MI", fullstate:"Michigan", ev:16, party:"SWING", index:"21", axis:"demgop"},
{state:"MN", fullstate:"Minnesota", ev:10, party:"SWING", index:"22", axis:"demgop"},
{state:"MS", fullstate:"Mississippi", ev:6, party:"SWING", index:"23", axis:"demgop"},
{state:"MO", fullstate:"Missouri", ev:10, party:"SWING", index:"24", axis:"demgop"},
{state:"MT", fullstate:"Montana", ev:3, party:"SWING", index:"25", axis:"demgop"},
{state:"NE", fullstate:"Nebraska", ev:5, party:"SWING", index:"26", axis:"demgop"},
{state:"NV", fullstate:"Nevada", ev:6, party:"SWING", index:"27", axis:"demgop"},
{state:"NH", fullstate:"New Hampshire", ev:4, party:"SWING", index:"28", axis:"demgop"},
{state:"NJ", fullstate:"New Jersey", ev:14, party:"SWING", index:"29", axis:"demgop"},
{state:"NM", fullstate:"New Mexico", ev:5, party:"SWING", index:"30", axis:"demgop"},
{state:"NY", fullstate:"New York", ev:29, party:"SWING", index:"31", axis:"demgop"},
{state:"NC", fullstate:"North Carolina", ev:15, party:"SWING", index:"32", axis:"demgop"},
{state:"ND", fullstate:"North Dakota", ev:3, party:"SWING", index:"33", axis:"demgop"},
{state:"OH", fullstate:"Ohio", ev:18, party:"SWING", index:"34", axis:"demgop"},
{state:"OK", fullstate:"Oklahoma", ev:7, party:"SWING", index:"35", axis:"demgop"},
{state:"OR", fullstate:"Oregon", ev:7, party:"SWING", index:"36", axis:"demgop"},
{state:"PA", fullstate:"Pennsylvania", ev:20, party:"SWING", index:"37", axis:"demgop"},
{state:"RI", fullstate:"Rhode Island", ev:4, party:"SWING", index:"38", axis:"demgop"},
{state:"SC", fullstate:"South Carolina", ev:9, party:"SWING", index:"39", axis:"demgop"},
{state:"SD", fullstate:"South Dakota", ev:3, party:"SWING", index:"40", axis:"demgop"},
{state:"TN", fullstate:"Tennessee", ev:11, party:"SWING", index:"41", axis:"demgop"},
{state:"TX", fullstate:"Texas", ev:38, party:"SWING", index:"42", axis:"demgop"},
{state:"UT", fullstate:"Utah", ev:6, party:"SWING", index:"43", axis:"demgop"},
{state:"VT", fullstate:"Vermont", ev:3, party:"SWING", index:"44", axis:"demgop"},
{state:"VA", fullstate:"Virginia", ev:13, party:"SWING", index:"45", axis:"demgop"},
{state:"WA", fullstate:"Washington", ev:12, party:"SWING", index:"46", axis:"demgop"},
{state:"WV", fullstate:"West Virginia", ev:5, party:"SWING", index:"47", axis:"demgop"},
{state:"WI", fullstate:"Wisconsin", ev:10, party:"SWING", index:"48", axis:"demgop"},
{state:"WY", fullstate:"Wyoming", ev:3, party:"SWING", index:"49", axis:"demgop"},
{state:"DC", fullstate:"District of Columbia", ev:3, party:"SWING", index:"50", axis:"demgop"},
]