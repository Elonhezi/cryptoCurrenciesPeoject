/// <reference path="jquery-3.5.1.js" />
"use strict";  

const arrOfToggleButton = [];
$(function() {  
    // get data from ajax on currencies:
    $(document).ready(async function() {
        try {
            const fullDetails = await getDataAsync("https://api.coingecko.com/api/v3/coins/list");
            displayAllDetails(fullDetails); //  display the data from ajax
            searchingCurrencies(fullDetails); // always  data is ready to searching
            displayAllCoinsAfterClickMainHeader(fullDetails); // on click on Main Header call to ajax to display all currencies
        } 
        catch (err) {
            alert("Error: " + err.status);
        }
    });

    function getDataAsync(url) {  // get data from ajax
        return $.ajax({
            url: url
        });
    }

    //display details about 100 currencies:
    function displayAllDetails(details) { 
        $("#pills-home").empty();
        for(let i = 1300; i <= 1400; i++) {
            const index = "index" + i;
            displayCurrencies(details[i] , index);
        }
    }

    // Create body of card for currencies:
    function displayCurrencies(details , index) {
        $("#pills-home").append(
        `<div class="card cardCoins" style="width: 23.5rem;">
            <div class="card-body">
                <h5 class="card-titled">${details.symbol}</h5>
                <div class="form-check form-switch">
                    <input  class="form-check-input flexSwitchCheckDefault" type="checkbox" id="toggle${details.symbol}" value="${details.symbol}">
                </div>
                <p class="card-text">${details.name}</p>
                <a id="${details.id}" class="btn btn-dark moreInfoButton" data-bs-toggle="collapse" href="#${index}" role="button" aria-expanded="false" aria-controls="${index}">More Info</a>
                <div class="row">
                    <div class="col">
                        <div class="collapse multi-collapse" id="${index}">
                            <div class="card card-body moreInfoField">     
                            </div>
                        </div>
                    </div>
                </div>    
            </div>
        </div>`);
        // check swich Button Always:
        // if(arrOfToggleButton.includes(details.symbol)) {
        //     enableButtonChoose(details.symbol);
        // }
        enableSwitchButtonOnArrayModal(details.symbol);
    }
    
    // get more data from ajax on click on "more info button":
    $("#pills-home").on("click",".moreInfoButton", function() {  
        try {
            $(this).next().children().children().on("shown.bs.collapse", async () => {
                const id =  $(this).attr('id');
                loadSpinner(this);
                const fullDetails = await getDataAsync(`https://api.coingecko.com/api/v3/coins/${id}`);   // Calling to function to get details from ajax
                saveMoreInfoForTwoMinutes(fullDetails, this);
            });
        } 
        catch (err) {
            alert("Error: " + err.status);
        }
    });
    
    // Create body to data from ajax after click on "more info button":
    function displayMoreInfoTable(fullDetails, specificObj){  
        $(specificObj).next().children().children().children().html(`
            <table class=" table table-striped">
                <thead>
                    <tr>
                        <th>
                            <label>Currency Price</label>
                            <img src="${fullDetails.image.small}" class="imageOfCurrency">
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${fullDetails.market_data.current_price.usd}&nbsp &#36</td>
                    </tr>
                    <tr>
                        <td>${fullDetails.market_data.current_price.eur}&nbsp &#128</td>
                    </tr>
                    <tr>
                        <td>${fullDetails.market_data.current_price.ils}&nbsp &#8362</td>
                    </tr>
                <tbody>
            </table>`);
    }

    // save data for Two minutes:    
    function saveMoreInfoOnStorage(fullDetails) {
        const json = JSON.stringify(fullDetails);
        sessionStorage.setItem(fullDetails.id, json);
    }

    function getMoreInfoOnStorage(fullDetails) {
        const json = sessionStorage.getItem(fullDetails.id);
        return JSON.parse(json);
    }

    function checkCurrencyStorage(fullDetails) {
        if (sessionStorage.getItem(fullDetails.id) === null) {
            return false;
        }
        else {
            return true;
        }
    }

    function saveMoreInfoForTwoMinutes(fullDetails, data) {
        if(checkCurrencyStorage(fullDetails)) { 
            const  getData = getMoreInfoOnStorage(fullDetails);  //action of save the data about currency that return from saving function
            displayMoreInfoTable(getData , data);  // display the data from session storage
        }
        else {
            saveMoreInfoOnStorage(fullDetails);
            displayMoreInfoTable(fullDetails , data);
            return new Promise ((resolve , reject) => {
                setTimeout(() => {
                    resolve (sessionStorage.removeItem(fullDetails.id)); // remove all item from session storage
                    reject(err => alert("Error on saving ! " + err));
                }, 1000 * 120);
            }); 
        }
    }
    
    // load icon on wait to ajax:
    function loadSpinner(id) {
        $(id).next().children().children().children().html(
            `<div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>`
        );
    }

    //get value of symbol coin on click switch button:
    $("#pills-home").on("click", ".form-check-input", function() {
        const currencySymbol = $(this).val();
        checkValidButtonToggle(currencySymbol);
    });
    
    // find index on array:
    function findIndexCoinFromArray(currencySymbol){
        return arrOfToggleButton.findIndex(item => item === currencySymbol);
    }
    // new array to save for the modal after pressing on more then 5 buttons switch as enable
    // const arrOfToggleButton = [];

    function checkValidButtonToggle(currencySymbol) {
        const index = findIndexCoinFromArray(currencySymbol);
        if(index !== -1 ) {
            arrOfToggleButton.splice(index , 1);
        }
        else if(arrOfToggleButton.length < 5) {
            arrOfToggleButton.push(currencySymbol);
        }
        else { //array bigger then 5 coins- so display modal.
            showModal(currencySymbol);
            saveButton(currencySymbol);            
            event.preventDefault();
        }
    }
    
    // create modal if the user try tap on toggle button bigger from 5..
    function showModal(currencySymbol) { 
        $("#modal").html(`
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Choose and remove coins</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span class="buttonModalX" aria-hidden="true">&times;</span>
                </div>
            <div class="modal-body">
                <div class = 'modalToggleBox card card-body'>                
                    <input type="radio" name="radioName" value="${arrOfToggleButton[0]}" /> ${arrOfToggleButton[0]} <br />
                    <input type="radio" name="radioName" value="${arrOfToggleButton[1]}" /> ${arrOfToggleButton[1]} <br />
                    <input type="radio" name="radioName" value="${arrOfToggleButton[2]}" /> ${arrOfToggleButton[2]} <br />
                    <input type="radio" name="radioName" value="${arrOfToggleButton[3]}" /> ${arrOfToggleButton[3]} <br />
                    <input type="radio" name="radioName" value="${arrOfToggleButton[4]}" /> ${arrOfToggleButton[4]} <br />
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" id="closeButtonModal" class="btn btn-secondary" data-bs-dismiss="modal" value="${currencySymbol}">Close</button>
                <button id="saveButtonModal" type="button" class="btn btn-primary">Save changes</button>
            </div>
            </div>
        </div>`);
        $("#modal").modal("show");     
    }

    // on click on save button modal- action of hide modal and remove the coin that we choose...
    function saveButton(currencySymbol) {
        $("#modal").on("click" , "#saveButtonModal" , ()=> { 
            $("#modal").modal("hide");
            removeSelectedCoin(currencySymbol);
            enableButtonChoose(currencySymbol);
        });
    }

    // on tap on cancel button or x icon - exit from modal and cancel the saving..
    $("#modal").on("click" , "#closeButtonModal" , function() { 
        const coin = $(this).val();
        disableButtonChoose(coin);
    });

    $("#modal").on("click" , ".buttonModalX" , ()=> { 
        $("#modal").modal("hide");
        const coin = $(this).val();
        disableButtonChoose(coin);
    });
    
    // Remove the choose coin from array
    function removeSelectedCoin(currencySymbol) {
        const coinChoose = $('input[name=radioName]:checked', '.modalToggleBox').val(); 
        const index = findIndexCoinFromArray(coinChoose);
        arrOfToggleButton.splice(index , 1);
        replaceCoin(currencySymbol);
        disableButtonChoose(coinChoose);
    }

    //turn of switch button of the value that taped. 
    function disableButtonChoose(coin) {
        $(`#toggle${coin}`).prop("checked", false);   
    }
    
    //turn on switch button of the value that taped (after tap on save changes).
    function enableButtonChoose(coin) {
        $(`#toggle${coin}`).prop("checked", true);   
    }

    function replaceCoin(currencySymbol) {            
        arrOfToggleButton.push(currencySymbol);
    }

    // on click header reset and call all the coins:
    function displayAllCoinsAfterClickMainHeader(details) {
        $("h1").click(function() {
            displayAllDetails(details);
            $("#searchResultsNum").empty();
        });        
    }
    
    // search field:
    function searchingCurrencies(fullDetails) {
        $("#searchBox").on("keyup" , async function() { 
            const searchedCoin = $('#searchBox').val().toLowerCase();   // get value from input field search
            $("#searchResultsNum").empty();
            let counterResultSearch = 0;
            let coinNameSymbol = "";
            let index = 0;
            if(searchedCoin !== "") {
                /////////////////////////////////////
                $("#pills-home").empty();
                for(let i = 1300; i <= 1400; i++) {
                    coinNameSymbol = fullDetails[i].symbol;
                    if(coinNameSymbol.includes(searchedCoin)){
                        counterResultSearch += 1; // number of search results...
                        index = "index" + i;
                        displayCurrencies(fullDetails[i] , index);
                        // if(arrOfToggleButton.includes(coinNameSymbol)) {
                        //     enableButtonChoose(coinNameSymbol);
                        // }
                    }   
                }
                displaySearchCounter(fullDetails , searchedCoin , counterResultSearch) // Show results number of searching and display the value that inserted..
            }
            else {
                displayAllDetails(fullDetails);            
            }
        });
    }   

    // after inserting value on input search and click on search button - show number of coins that founded and display the value that inserted..
    function displaySearchCounter(fullDetails , searchedCoin , counterResultSearch) {
        if (counterResultSearch === 0){
            displayAllDetails(fullDetails);
            $("#searchResultsNum").html(`
                <div>
                    <h4><strong> No Search Results To: "${searchedCoin}"</strong></h4>
                </div>
            `);
            $("#searchResultsNum").css("color" , "red");
        }
        else{
            $("#searchResultsNum").css("color" , "black");
            $("#searchResultsNum").html(`
                <div>
                    <h5>Search Results For: "${searchedCoin}" (${counterResultSearch})</h5>
                </div>    
            `);
        }
    }

    // on click on button about or reports- clear the box of search result:
    $(".aboutButton").on("click", function() {
        $("#searchResultsNum").empty();
    });
    $(".reportsButton").on("click", function() {
        $("#searchResultsNum").empty();
    });

    // checck on display card if inculde on array of modal: 
    function enableSwitchButtonOnArrayModal(coinSymbol) {
        if(arrOfToggleButton.includes(coinSymbol)) {
            enableButtonChoose(coinSymbol);
        }
    }
});
