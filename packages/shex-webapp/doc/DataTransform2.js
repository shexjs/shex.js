async function renderOutput(data) {
	if (!data){
		console.log("data missing at time of table render")
	}
	
	//create headers for output table
	//NOTE: THIS MOVED OUTSIDE FUNCTION TO ACCOMODATE RENDERING METHOD
	// headers = ["Item", "Shape", "Property", "Value", "Error Type", "Triple Link", "Further Error Info"]
	// for (var i = 0 ; i < headers.length; i++) {
		// output = output + "<th>" + headers[i] + "</th>"
		// addElement('header_row', 'th', "", headers[i])
	// }

	//construct query prefix string  & endpoint via input fields
	//for final release: change default to wikidata
	var endpoint = "https://query.wikidata.org/sparql"//"https://validatortest.wikibase.cloud/query/sparql"
	if ($("#query_endpoint").val() != ""){
		//overwrite query endpoint if it has content
		endpoint = $("#query_endpoint").val() 
	}
	var wikibase_pre = "http://www.wikidata.org"//"https://validatortest.wikibase.cloud"
	if ($("#wikibase_prefix").val() != ""){
		wikibase_pre = $("#wikibase_prefix").val()
	}
	prefixes = `
PREFIX wd: <` + wikibase_pre + `/entity/>
PREFIX p: <` + wikibase_pre + `/prop/>
PREFIX ps: <` + wikibase_pre + `/prop/statement/>
PREFIX wdt: <` + wikibase_pre + `/prop/direct/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pq: <` + wikibase_pre + `/prop/qualifier/>
PREFIX pr:  <` + wikibase_pre + `/prop/reference/>
#specific prefixes
PREFIX wdv: <` + wikibase_pre + `/entity/value/>
PREFIX s: <` + wikibase_pre + `/entity/statement/>
PREFIX psv: <` + wikibase_pre + `/prop/statement/value/>
`
	
	

// PREFIX wd: <https://validatortest.wikibase.cloud/entity/>
// PREFIX p: <https://validatortest.wikibase.cloud/prop/>
// PREFIX ps: <https://validatortest.wikibase.cloud/prop/statement/>
// PREFIX wdt: <https://validatortest.wikibase.cloud/prop/direct/>
// PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
// PREFIX prov: <http://www.w3.org/ns/prov#>
// PREFIX pq: <https://validatortest.wikibase.cloud/prop/qualifier/>
// PREFIX pr:  <https://validatortest.wikibase.cloud/prop/reference/>
// #specific prefixes
// PREFIX wdv: <https://validatortest.wikibase.cloud/entity/value/>
// PREFIX s: <https://validatortest.wikibase.cloud/entity/statement/>
// PREFIX psv: <https://validatortest.wikibase.cloud/prop/statement/value/>

	
	for (var i = 0; i < data.length; i++){
		var dataArray = createArray(data[i])
		
		
		// get data required for pretty display
		
		var item_ID_link = data[i].node.split('/')
		var query = prefixes + `

SELECT ?item ?p_property ?p_propertyLabel ?statementLink ?simplevalue ?simplevalueLabel 
WHERE
{
  wd:` + item_ID_link[item_ID_link.length - 1] + ` ?property ?statementLink . 
  ?statementLink ?simplevalueLink ?simplevalue .
  wd:` + item_ID_link[item_ID_link.length - 1] + ` ?propdirect ?simplevalue.
  wd:` + item_ID_link[item_ID_link.length - 1] + ` rdfs:label ?item.
 
  #find property label (thanks to tagishsimon)
  ?p_property wikibase:claim ?property .
  
  FILTER(STRSTARTS(STR(?propdirect), STR(wdt:)))
  FILTER(STRSTARTS(STR(?property), STR(p:))) 
  #BIND(STR(?simplevalueLink) as ?xxx)
  FILTER(STRSTARTS(STR(?simplevalueLink),  STR(ps:)))
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } # Helps get the label in your language, if not, then en language
  #only get English language item names (this prevents duplicate rows in the query output, and helps getting the correct row for eventual output, rather than the first language available)
  FILTER(LANGMATCHES(LANG(?item), "en"))
}` //` + item_ID_link[item_ID_link.length - 1] + `
		
		await fetch(endpoint + "?" + new URLSearchParams({'format' : "json"}), {
				method : "POST",
				body: new URLSearchParams({'query' : query}),
				headers: {
					'Accept': 'application/sparql-results+json',
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
					},
					mode:'cors'
			}).then(response => response.json()).then(querydata => {
				var markedUpArry = addMarkupData(dataArray, querydata, data[i].node)
				
				displayTable(markedUpArry)
				
			})

		//test options to show JSON form of input & array
	 	// addElement('results', 'div', 'test', '[Item, Property, value, shape, issue type]') ;
		// addElement('results', 'div', 'test', JSON.stringify(arry)) ;
		// addElement('results', 'div', 'test', '<br>')
		// addElement('results', 'div', 'test', JSON.stringify(data[i]))
		// addElement('results', 'div', 'test', '<br>')
		// addElement('results', 'div', 'test', '<br>')  
	
	
	}
	return 
}

function createArray(x) {
	//intent: take a Eval results (ret) as JSON
	//turn it into an array with columns item, shape, property, value,  issue type, triple link, full error message
	//const x = JSON.parse(loadFile('./Responses/Eval_E3_v2.txt'))
	

	
	if (x.status === 'conformant') {
		//if here: add 1 row containing item name, then conformant in all other cells
		const row_vals = [{item : {text : [x.node], rowcount : 1}, shape : x.shape.term, 
		error_type : 'Passed all checks'}]
		
		return row_vals
	}
	
	//addElement('output_container', 'div', 'test', JSON.stringify(x[0].appinfo.errors[0].errors.errors[0]))
	
	var tableRows = goThroughJSON(x.appinfo);
	
	//sort rows, starting on the last column and going backwards towards the first
	tableRows.sort(create_compare_by_attr('error_type'))
	tableRows.sort(create_compare_by_attr('value'))
	tableRows.sort(create_compare_by_attr('property'))
	tableRows.sort(create_compare_by_attr('shape'))
	tableRows.sort(create_compare_by_attr('item'))
	
	//remove duplicate rows
	tableRows = uniqRow(tableRows)
	
	//calculate the required rowcounts for each 
	var prop_counts = [0]
	var value_counts = [0]
	var shape_counts = [0]
	var item_counts = [0]
	last_value = tableRows[0].value
	last_prop = tableRows[0].property
	last_shape = tableRows[0].shape
	last_item = tableRows[0].item
	for (var i = 0 ; i < tableRows.length ; i++){
		//Property
		if (tableRows[i].property == last_prop) {
			prop_counts[prop_counts.length-1] += 1
		} else {
			prop_counts.push(1)
			last_prop = tableRows[i].property
		}
		//value
		if (tableRows[i].value == last_value) {
			value_counts[value_counts.length-1] += 1
		} else {
			value_counts.push(1)
			last_value = tableRows[i].value
		}
		//shape
		if (tableRows[i].shape == last_shape) {
			shape_counts[shape_counts.length-1] += 1
		} else {
			shape_counts.push(1)
			last_shape = tableRows[i].shape
		}
		//item
		//note: more complex to deal with arrays
		change = false
		for (var j=0;j<tableRows[i].item.length;j++){
			if (tableRows[i].item[j] != last_item[j]){
				change=true
			}
		}
		if (!change) {
			item_counts[item_counts.length-1] += 1
		} else {
			item_counts.push(1)
			last_item = tableRows[i].item
		}
	}
	
	
	//for item, shape, property, and value, specify the required rowcount. For items not to be shown, use 0
	var value_countdown = 0
	var prop_countdown = 0
	var shape_countdown = 0
	var item_countdown = 0
	for (var i = 0 ; i < tableRows.length; i++){
		//add the item to the front of the row, with rowcount
		//var rowcount = tableRows.length * (i == 0);
		// tableRows[i].item = {text : x.node, rowcount : rowcount};
		if (item_countdown == 0) {
			tableRows[i].item = {text : tableRows[i].item, rowcount : item_counts[0]};
			item_countdown = item_counts.shift()-1
		} else {
			tableRows[i].item = {text : tableRows[i].item, rowcount : 0}
			item_countdown -= 1
		}
		
		//add the right rowcount for value
		if (value_countdown == 0) {
			tableRows[i].value = {text : tableRows[i].value, rowcount : value_counts[0]};
			value_countdown = value_counts.shift()-1
		} else {
			tableRows[i].value = {text : tableRows[i].value, rowcount : 0}
			value_countdown -= 1
		}
		//property
		if (prop_countdown == 0) {
			tableRows[i].property = {text : tableRows[i].property, rowcount : prop_counts[0]}
			prop_countdown = prop_counts.shift()-1
		} else {
			tableRows[i].property = {text : tableRows[i].property, rowcount : 0}
			prop_countdown -= 1
		}
		//shape
		if (shape_countdown == 0) {
			tableRows[i].shape = {text : tableRows[i].shape, rowcount : shape_counts[0]}
			shape_countdown = shape_counts.shift()-1
		} else {
			tableRows[i].shape = {text : tableRows[i].shape, rowcount : 0}
			shape_countdown -= 1
		}
	}
	
	

	return tableRows
	
	
	 
}

function goThroughJSON(data) {
	//takes JSON validation report
	//returns Array of JSON Objects which represents a table
	
	var output = []
	const objectConstructor = ({}).constructor
	
	if (data.errors instanceof Array) {
		//catching NodeConstraintViolations with a single string as their list of errors
		if (typeof(data.errors[0]) === 'string') {
			output = [createArrayRow(data)]
		} else {
		
			for (var i = 0 ; i < data.errors.length; i++) {
				//recurse if there are more errors in the JSON object inside this one
				addition = goThroughJSON(data.errors[i])
				
				//console.log(addition)
				output = output.concat(addition)
				
			}
		}
	} else if (data.errors instanceof Object){
		//recurse if errors is a single JSON dict
		output = goThroughJSON(data.errors)
		
	} else {
		//if you reached the bottom of the error stack, create a row for this error
		//if the item is still wrapped in an array (happens in some cases with data from wikidata) go through al items in that array
		if (data instanceof Array) {
			for (var i=0;i<data.length;i++){
				output = output.concat(goThroughJSON(data[i]))
			}
		} else {
		output = createArrayRow(data)
		}
	}
	//make sure the output is an array containing row JSON objects
	if (output.constructor === objectConstructor) {
		output = [output]
	}
	
	//try to add a shape to each datapoint that doesn't have one yet:
	for (var i = 0 ; i < output.length; i++){
		if (!(Object.hasOwn(output[i], 'shape')) && Object.hasOwn(data, 'shape')){
			output[i].shape = data.shape
		}
		//try to add new item information available at this height in the stack
		
		if (Object.hasOwn(data, 'node') && typeof(data.node) === 'string'){
			splitted = data.node.split("/")
			if (!(splitted[splitted.length-2] == "statement")){ //don't allow addition of statement nodes
				if (!(Object.hasOwn(output[i], 'item'))){
					output[i].item = [data.node]
				} else {
					output[i].item.unshift(data.node)
				}
			}
		}
		//TODO: Also add possible value and property information available if not yet there
		//for nodeconstraints this is for example data.triple.object and data.triple.predicate
	}
	return output
}

function createArrayRow(item) {
	//takes an item of one of the types that requires outputting 1 row
	//creates a JSON object representing a row in the output data
	//output row template: {property, value, error type}
	
	var output = {}
	if (item.type == "MissingProperty") {
		output.property =  item.property;
		output.error_type = "Missing Property"//item.type
	} else if (item.type == "NodeConstraintViolation"){
		output.error_type = "Complex Error"//item.type
		output.value = item.node.value
		output.error_fulltext = item.errors[0]
	} else if (item.type == "ExcessTripleViolation") {
		output.error_type = "Too many values"//item.type
		output.error_fulltext = item
		output.property = item.triple.predicate.id //value is wrong name for wikidata? Maybe should be id instead?
		output.value = item.triple.object.id //value is wrong name for wikidata? Maybe should be id instead?
	} else if (item.type == "TypeMismatch") {
		output.error_type = item.type
		output.error_fulltext = item + "<= This was not supposed to happen. Contact the developer and help them improve this tool by telling you what you did!"
		console.log(item)
		console.log('type mismatch detected! Implement to continue')
	} else if (item.type == 'SemActFailure') {
		output.error_type = item.type
		output.error_fulltext = item + "<= This was not supposed to happen. Contact the developer and help them improve this tool by telling you what you did!"
		console.log(item)
		console.log('Semaphote Act Failure detected! Implement to continue')
	} else if (item.type == 'ClosedShapeViolation') {
		output.error_type = item.type
		output.error_fulltext = item + "<= This was not supposed to happen. Contact the developer and help them improve this tool by telling you what you did!"
		console.log(item)
		console.log('Closed Shape Violation detected! Implement to continue')
	}else {
		output.error_type = item.type
		output.error_fulltext = item + "<= This was not supposed to happen. Contact the developer and help them improve this tool by telling you what you did!"
	}
	//console.log(item)
	//console.log(output)
	return output
}

function create_compare_by_attr(attr){
	//Returns a function that takes two JSON objects, and compares their 'attr' attribute
	//This returned function can be used to sort an Array of JSON Objects on said attribute stably using ArrayName.sort(TheNewFunction)
	return function(a,b) {
		if (a[attr] > b[attr]){
			return 1
		} else if (a[attr] < b[attr]) {
			return -1
		} else {
			return 0
		}
	}
}

function displayTable(dataArray){
	//Takes an array of JSON objects, where each object represents a row. 
	//Displays this as a table with columns item, shape, property, value,  issue type, triple link, full error message
	//All row HTML elements have an id of [item_ID]_[row_nr]
	
	//console.log(dataArray)
	
	var item_link_split = dataArray[0].item.text[0].split("/")
	var item_ID = item_link_split[item_link_split.length - 1]
	var row_nr = 0
	
	var output = ""
	
	for (var i = 0 ; i < dataArray.length; i++) {
		full_ID = item_ID + "_" + row_nr
		output = output + addRow(dataArray[i], full_ID)
		row_nr+=1
	}
	return output
}

function addRow(rowJSON, row_ID) {
	//console.log(rowJSON)
	//to prevent duplicate rows, remove a row with the same id
	//TODO: make the IDs into the Qids to they are truly  unique
	const element = document.getElementById(row_ID);
	if (element instanceof HTMLElement) {
		element.remove()
	}		
	
	//adds a single row to the table
	//add row element to child cells to:
	var output = "<tr id="+row_ID+">"
	addElement('table_body', 'tr', row_ID, "")
	
	//get conformance information
	var conforms = null
	if (rowJSON.error_type == "Passed all checks"){
		conforms = "#6fff6f"
	}
	
	//add all child cells in order
	output = output + addCell(rowJSON.item, row_ID, conforms)
	output = output + addCell(rowJSON.shape, row_ID, conforms)
	output = output + addCell(rowJSON.property, row_ID, conforms)
	output = output + addCell(rowJSON.value, row_ID, conforms)
	output = output + addCell(rowJSON.error_type, row_ID, conforms)
	output = output + addCell(rowJSON.triple_link, row_ID, conforms)
	output = output + addCell(JSON.stringify(rowJSON.error_fulltext), row_ID, conforms)
	
	output = output + "</tr>"
	return output
}

function addCell(cellJSON, row_ID, bg_colour){
	//add a single cell to the specified row of a table
	
	
	
	if (cellJSON instanceof Object ){ //what to do for complex input
		//don't create elements for things not to be displayed
		if (cellJSON.rowcount != 0) {
			var p = document.getElementById(row_ID);
			var newElement = document.createElement('td');
			if (cellJSON.text instanceof Array){
				// if the text consists of multiple elements, print each after another when creating innterHTML
				if (cellJSON.text.length != cellJSON.link.length) {
					console.log("Error: wrong number of links vs text")
					console.log(cellJSON)
				}
				first = true
				innerHTML = "<floattext>"
				for (i=0;i<cellJSON.text.length;i++){
					if (!first){
						innerHTML = innerHTML+" => "
					}
					first = false
					innerHTML = innerHTML + addLink(cellJSON.text[i], cellJSON.link[i])
				}
				innerHTML = innerHTML + "</floattext>"
				newElement.innerHTML = innerHTML
			} else if (cellJSON.text === undefined) {
				//if there is no text, print an empty cell
				var p = document.getElementById(row_ID);
				var newElement = document.createElement('td');
				//recolour to desired colour
				newElement.setAttribute("style", "background-color:"+bg_colour)
				newElement.setAttribute('rowspan', cellJSON.rowcount);
				p.appendChild(newElement)
			} else {
				newElement.innerHTML = addLink(cellJSON.text, cellJSON.link)
			}
			
			var output = "<td class='highcell' rowspan='" + cellJSON.rowcount + "'" + newElement.innerHTML
			
			newElement.setAttribute('class', "highcell");
			newElement.setAttribute('rowspan', cellJSON.rowcount);
			
			
			//recolour to desired colour
			newElement.setAttribute("style", "background-color:"+bg_colour)
			p.appendChild(newElement)
		}
	} else if (cellJSON === undefined) {
		var p = document.getElementById(row_ID)
		var newElement = document.createElement("td");
		newElement.setAttribute("style", "background-color:"+bg_colour)
		p.appendChild(newElement)
		var output = "<td></td>"
	} else { //what to do for simple cells
		var p = document.getElementById(row_ID);
		var newElement = document.createElement('td');
		var output = "<floattext>" + cellJSON + "</floattext>"
		newElement.innerHTML = "<floattext>" + cellJSON + "</floattext>";
		newElement.setAttribute("style", "background-color:"+bg_colour)
		p.appendChild(newElement)
	}
	
	
	return output
}

function addLink(text, link){
	//given a link and bit of text, wraps that in a tag and if needed adds small subtext
	output = ""
	output_end = ""
	
	if (link){
		output = output + "<a href=" + link + " target='_blank'>"
		output_end = output_end + "</a>"
		if (getLinkID(link) != text){
			output_end =  "<small>(" + getLinkID(link) + ")</small>" + output_end
		}
	}
	
	output = output + text
	
	return output + output_end
}

function addMarkupData(dataArray, markupArray, node) {
	//goes through dataArray. For each item property and value tries to add markup information using the markupArray
	//also cuts shape text prefix
	//uses node to check for the original item
	
	for (var i=0; i<dataArray.length;i++){
		//shape
		if (dataArray[i].shape instanceof Object && dataArray[i].shape.text) {
			//is not just the string start, but a string with rowcount applied
			//then get only the identifying part
			//add link as link (note: this means if user clicks it it tries to download schema text instead of going to schema page)
			dataArray[i].shape.link = dataArray[i].shape.text
			dataArray[i].shape.text = getLinkID(dataArray[i].shape.text)
		}
		//Item
		if (dataArray[i].item instanceof Object && dataArray[i].item.text){
			//check if item.text is an array 
			if (dataArray[i].item.text instanceof Array){
				//check if there is no link yet, if there is note problem
				if (dataArray[i].item.link){
					console.log("unexpected item link before assignment:" + dataArray[i].item)
				}
				dataArray[i].item.link = []
				for (var j=0;j<dataArray[i].item.text.length;j++){
					//add each link as a link
					dataArray[i].item.link.push(dataArray[i].item.text[j])
					//check if this is the original item, if so skip next steps
					if (dataArray[i].item.text[j] == node){
						dataArray[i].item.text[j] = markupArray.results.bindings[0].item.value
					} else {
						dataArray[i].item.text[j] = getLinkID(dataArray[i].item.text[j])//if no match found, fail semi-gracefully by showing the ID instead of the entire link
						
						for (var k=0;k<markupArray.results.bindings.length; k++){
							//check if the link matches any links to values in our item
							query_ID = getLinkID(markupArray.results.bindings[k].simplevalue.value)
							if (dataArray[i].item.text[j] == query_ID){
								dataArray[i].item.text[j] = markupArray.results.bindings[k].simplevalueLabel.value
							}
						}
					}
				}
			} else {
				console.log("item of unexpected shape:" + dataArray[i].item)
			}
		}
		//Property
		var working_pj_list = []
		if (dataArray[i].property instanceof Object && dataArray[i].property.text){ 
			dataArray[i].property.link = dataArray[i].property.text
			pID = getLinkID(dataArray[i].property.text)
			dataArray[i].property.text = pID //if no match found, fail semi-gracefully by showing the ID instead of the entire link
			
			for (var j=0; j<markupArray.results.bindings.length; j++){
				//check whether link (.property.link) matches markuparray.results.bindings[j].p_property.value
				query_pID = getLinkID(markupArray.results.bindings[j].p_property.value)
				if (pID == query_pID){
					dataArray[i].property.text = markupArray.results.bindings[j].p_propertyLabel.value
					working_pj_list.push(j)
				}
			}
		}
		//TODO: check MarkupArray for correct text
		//Value
		var working_vj_list = []
		if (dataArray[i].value instanceof Object && dataArray[i].value.text){
			//add a link, if the value has / in it
			var splitarry = dataArray[i].value.text.split("/")
			if (splitarry.length>1){
				dataArray[i].value.link = dataArray[i].value.text
			}
			
			dataArray[i].value.text = getLinkID(dataArray[i].value.text) //if no match found, fail semi-gracefully by showing the ID instead of the entire link
			
			for (var j=0; j<markupArray.results.bindings.length;j++){
				query_pID = getLinkID(markupArray.results.bindings[j].simplevalue.value)
				if (dataArray[i].value.text == query_pID){
					dataArray[i].value.text = markupArray.results.bindings[j].simplevalueLabel.value
					working_vj_list.push(j)
				}
			}
		}
		
		//if something was found for both property and value, find the associated statement Link
		dataArray[i].triple_link = undefined //fail gracefully if no triple link involved
		for (j=0; j<working_pj_list.length;j++){
			for (k=0; k<working_vj_list.length;k++){
				if (j==k){ //this is definitely wrong
					console.log('found')
					dataArray[i].triple_link = {text : "Link", rowcount : 1, link : markupArray.results.bindings[j].statementLink.value}
				}
			}
		}
	}
	return dataArray
}

function getLinkID(link_str){
	//Gets the last part of a given link
	//which given a Wikidata link will be the ID
	var splitarray = link_str.split("/")
	var potential_id = splitarray[splitarray.length-1]
	
	return potential_id
}

//adapted from https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array	
function uniqRow(a) {
	//strip prefixes for value, property, shape, keep only main domain and actual id
	var strippedArray = []
	for (var i=0;i<a.length;i++){
		strippedArray.push({})
		try{
		var val_split = a[i].value.split("/")
		} catch {val_split = ""}
		
		if (val_split instanceof Array){
			strippedArray[i].val_domain = val_split[2]
			strippedArray[i].val_id = val_split[val_split.length-1]
		} else {
			strippedArray[i].val_domain = ""
			strippedArray[i].val_id = ""
		}
		//property
		try{
		var prop_split = a[i].property.split("/")
		} catch {prop_split = ""}
		if (prop_split instanceof Array){
			strippedArray[i].prop_domain = prop_split[2]
			strippedArray[i].prop_id = prop_split[prop_split.length-1]
		} else {
			strippedArray[i].prop_domain = ""
			strippedArray[i].prop_id = ""
		}
		//shape
		try{
		shape_split = a[i].shape.split("/")
		} catch {shape_split = ""}
		if (shape_split instanceof Array){
			strippedArray[i].shape_domain = shape_split[2]
			strippedArray[i].shape_id = shape_split[shape_split.length-1]
		} else {
			strippedArray[i].shape_domain = ""
			strippedArray[i].shape_id = ""
		}
		//get ID number
		strippedArray[i].i = i
	}
	
	var output = []
	//get only unique values in strippedArray, ignoring i
	for (var i=0;i<strippedArray.length;i++){
		duplicate = false
		for (var j=0;j<i;j++){
			if (strippedArray[i].val_domain == strippedArray[j].val_domain &&
				strippedArray[i].val_id == strippedArray[j].val_id &&
				strippedArray[i].prop_domain == strippedArray[j].prop_domain &&
				strippedArray[i].prop_id == strippedArray[j].prop_id &&
				strippedArray[i].shape_domain == strippedArray[j].shape_domain &&
				strippedArray[i].shape_id == strippedArray[j].shape_id &&
				a[i].error_type == a[j].error_type){
					duplicate = true
				}
		}
		if (!duplicate){
			output.push(a[i])
		}
	}
	
	return output
}

//imported functions:
function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}

function addElement(parentId, elementTag, elementId, html) {
		// Adds an element to the document
		var p = document.getElementById(parentId);
		var newElement = document.createElement(elementTag);
		newElement.setAttribute('id', elementId);
		newElement.innerHTML = html;
		p.appendChild(newElement);
	}

