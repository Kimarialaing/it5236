function checkLength10(elem){
	if (elem.value.length > 10){
		elem.value = elem.value.substring(0,10);
	}
}
function doSubmit(e) {
	var saveLocal = document.getElementById("saveLocal").checked = true;
	//var saveSession = document.getElementById("saveSession").checked = true;
	if (saveLocal) {
		console.log("Saving username to local storage");
		var username = document.getElementById("username").value;
		localStorage.setItem("username",username);
		//sessionStorage.removeItem("username");
	} else if (saveSession) {
		console.log("Saving username to session storage");
		var username = document.getElementById("username").value;
		//sessionStorage.setItem("username",username);
		localStorage.removeItem("username");
	} else {
		localStorage.removeItem("username");
		//sessionStorage.removeItem("username");
	}
}

function doPageLoad(e) {
	console.log("Reading username from local/session storage");
	var usernameLocal = localStorage.getItem("username");
	//var usernameSession = sessionStorage.getItem("username");
	if (usernameLocal) {
		document.getElementById("saveLocal").checked = true;
		document.getElementById("username").value = usernameLocal;
	}
	//else if (usernameSession) {
		//document.getElementById("saveSession").checked = true;
		//document.getElementById("usernameField").value = usernameSession;
	//} else {
		//document.getElementById("noSave").checked = true;
	//}
}

// Add event listeners for page load and form submit
window.addEventListener("load", doPageLoad, false)
document.getElementById("Form").addEventListener("submit", doSubmit, false);


