var isSelected = false, isCopied = false, draggin = false, isGroupExist = false;
var selectedCells = [],  data = [], selectedGroup = [], val_arr = [];
var selectedGrid = null, draggedCell = null, clicked_cell = null, topaste_cell = null, grpId = null, copied_cell = null;
var copy_value = 0, index , rows = 50, cols = 50, value = 0, horizontal, vertical, menu, recentGroupId = 0, hlGrid = NaN;
window.onload = createTable;
function createTable(){ 
	//rows = parseInt(document.getElementById("rows").value);
	//cols = parseInt(document.getElementById("cols").value);
   	var table = "<table border =1>"
    for(let i = 0; i<rows; i++){
		table = table + "<tr>"; 
        for(let j = 0; j<cols; j++)
	    {
        	table = table + `<td id="cell-${i}-${j}">`+"</td>";
		}	
        table = table + "</tr>"; 
	}
	table = table + "</table>";
    document.getElementById("table-container").innerHTML = table;
	for(let i=0;i < data.length;i++){
		placedGrid(data[i].leftTopRow,data[i].leftTopCol,data[i].rightTopRow,data[i].rightTopCol,data[i].value,data[i].color,data[i].grpId)
		if(data[i].value > value)
			value = data[i].value;
	}
    for(let i=0; i<rows; i++)
	{
		for(let j=0; j<cols; j++)
		{	
			var cell=document.getElementById(`cell-${i}-${j}`);
            cell.classList.add('prevent-select');
			cell.addEventListener('mousedown',(event)=>{
				//console.log("mousedown");
		    	isSelected = true
		    	selectedCells=[]
    			selectedCells.push(event.target)
		    	event.target.classList.add('selected')
		    });
			cell.addEventListener('mousemove',(event)=>{
				//console.log("mousemove");
			    if(isSelected == true)
			    {
    				if(!selectedCells.includes(event.target)){
	    				selectedCells.push(event.target);
		    			event.target.classList.add('selected');
    				}
	    		}
				else{
				    event.target.classList.remove('selected');
					event.preventDefault();
				}
		    });
			cell.addEventListener('mouseup',(event)=>{
				var gcolor = document.getElementById("gcolor").value;
				isSelected =false;
				if(isCopied == false)
				{
					var maxRow = 0;
					var maxCol = 0;
					var minRow = rows;
					var minCol = cols;
					for(let cell=0; cell< selectedCells.length; cell++)
					{ 
						var info = selectedCells[cell].id.split('-');
						var horizontal = parseInt(info[1]);
						var vertical = parseInt(info[2]);
						minRow = Math.min(minRow , horizontal);
						minCol = Math.min(minCol , vertical);
						maxRow = Math.max(maxRow , horizontal);
						maxCol = Math.max(maxCol , vertical);
					}
					if(canPlaceGrid(minRow, minCol, maxRow, maxCol))
					{
						var b_color = getRandomColor();     
						data.push({
							leftTopCol: minCol,
							leftTopRow: minRow,
							rightTopCol: maxCol,
							rightTopRow: maxRow,
							value: data.length + 1,
							color: gcolor,
							grpId : grpId
						})
						placedGrid(minRow, minCol, maxRow, maxCol, data[data.length - 1].value, data[data.length - 1].color, grpId);
					}
					else
					{
						console.log("Grid is overlapping another grid");
					}
					for(let i=0; i< selectedCells.length; i++)
					{
						selectedCells[i].setAttribute("draggable", "true");
						selectedCells[i].classList.remove('selected');	
					}
					selectedCells = [];
				}
				else
				{
					event.preventDefault();
				}
			});
			cell.addEventListener('dragstart', (e) => {
				//console.log("dragstart");
				if (!isNaN(parseInt(e.target.innerText))) {
					draggin = true;
					var info = e.target.id.split('-');
					let horizontal = parseInt(info[1]);
					let vertical = parseInt(info[2]); 
					draggedCell = { row: horizontal, column: vertical };
					value = parseInt(document.getElementById(`cell-${horizontal}-${vertical}`).innerText);
			
					selectedGrid = data[value-1];
					if(selectedGrid && selectedGrid.grpId) {
						selectedGroup = data.filter(d => d.grpId === selectedGrid.grpId);
						val_arr = selectedGroup.map(groupCell => groupCell.value);
					} else {
						selectedGroup = [selectedGrid]; 
						val_arr = [selectedGrid.value];
					}
				}
				console.log(val_arr);
				e.target.classList.remove('selected');
			});
			
			cell.addEventListener('drag',(e)=>{
			//	console.log("drag");
				e.preventDefault()
			});
			cell.addEventListener('dragover',(e)=>{
				//console.log("dropover");
				e.preventDefault();
			});		
			cell.addEventListener('drop', (e) => {	
				console.log("drop");
				e.preventDefault();
				if(draggin) {
					var info = e.target.id.split('-');
					var newRow = parseInt(info[1]);
					var newCol = parseInt(info[2]);
					let rowOffset = newRow - draggedCell.row;
					let colOffset = newCol - draggedCell.column;
			
					let canPlace = true;
					for(let groupCell of selectedGroup) {
						let {leftTopRow, leftTopCol, rightTopRow, rightTopCol, value} = groupCell;
						if (leftTopRow + rowOffset < 0 || leftTopCol + colOffset < 0 || rightTopRow + rowOffset >= rows || rightTopCol + colOffset >= cols || (canPlaceGridOnDrop(leftTopRow + rowOffset, leftTopCol + colOffset, rightTopRow + rowOffset, rightTopCol + colOffset, val_arr) == false)) {
							canPlace = false;
							break;
						}
					}
					if(canPlace) {
						selectedGroup.forEach(groupCell => {
							let { leftTopRow, leftTopCol, rightTopRow, rightTopCol, value, color } = groupCell;
							for (let i = leftTopRow; i <= rightTopRow; i++) {
								for (let j = leftTopCol; j <= rightTopCol; j++) {
									const cell = document.getElementById(`cell-${i}-${j}`);
									cell.innerHTML = '';
									cell.style.backgroundColor = '';
								}
							}
						});
						selectedGroup.forEach(groupCell => {
							let { leftTopRow, leftTopCol, rightTopRow, rightTopCol, value, color } = groupCell;
							groupCell.leftTopRow += rowOffset;
							groupCell.leftTopCol += colOffset;
							groupCell.rightTopRow += rowOffset;
							groupCell.rightTopCol += colOffset;
							placedGrid(groupCell.leftTopRow, groupCell.leftTopCol, groupCell.rightTopRow, groupCell.rightTopCol, value, color, groupCell.grpId);
						});	
					}else {
						console.log("Grid can't fit");
						e.target.classList.remove('selected');
					}
					isSelected = false;
				}
			});
			
			cell.addEventListener('dragend',(e)=>{
			//	console.log("dragend");
				e.preventDefault();
				draggin = false;
			});	
			cell.addEventListener('contextmenu', (e)=>{
			//	console.log("contextmenu");
				e.preventDefault();
				var info = e.target.id.split('-');
				horizontal = parseInt(info[1]);
				vertical = parseInt(info[2]);
				clicked_cell = {row : horizontal , column : vertical};
				addInGroupVal = parseInt(document.getElementById(`cell-${horizontal}-${vertical}`).innerText);
				menu = document.getElementById("contextMenu");
				menu.style.left = `${e.clientX}px`;
				menu.style.top = `${e.clientY}px`;
				menu.style.display = 'block';	
				e.preventDefault();				
			});
		}
	}
}
document.addEventListener('click',(e) =>{
	document.getElementById("contextMenu").style.display = 'none';
	e.target.classList.remove('selected');
	isSelected = false;
});
function createGrid(){
    var startR = parseInt(document.getElementById("startR").value);
    var startC = parseInt(document.getElementById("startC").value);
    var endR = parseInt(document.getElementById("endR").value);
    var endC = parseInt(document.getElementById("endC").value);
    var gcolor = document.getElementById("gcolor").value;
	var temp;
	if(startR > endR){
		temp = endR;
		endR = startR;
		startR = temp;
	}
	if(startC > endC){
		temp = endC;
		endC = startC;
		startC = temp;
	}	
	//console.log("enter",startR,startC,endR,endC,gcolor);
	if(startR < 0 || endR > rows || startC < 0 || endC > cols){
		console.log("Grid is not valid ,Select valid grid ")
	}
	else
	{	
		for(let i = startR; i <= endR; i++)
		{
			for(let j = startC; j <= endC; j++)
			{	
				var cell = document.getElementById(`cell-${i}-${j}`);
				if (cell) {
					cell.classList.add("selected");
					cell.classList.add("prevent-select");
					selectedCells.push(cell);	
				};
			}
		}
		if(canPlaceGrid(startR, startC, endR, endC))
		{
			var b_color = getRandomColor();     
			data.push({
				leftTopCol: startC,
				leftTopRow: startR,
				rightTopCol: endC,
				rightTopRow: endR,
				value: data.length + 1,
				color: gcolor,
				grpId : null
			})
			console.log(data[data.length -1].color);
			placedGrid(startR, startC, endR, endC, data[data.length - 1].value, data[data.length - 1].color);
		}
		else
		{
			console.log("Grid is overlapping another grid");
		}
		for(let i=0; i< selectedCells.length; i++)
		{
			selectedCells[i].setAttribute("draggable", "true");
			selectedCells[i].classList.remove('selected');	
		}
		selectedCells = [];
		//draggin = true;
	}	
}
document.getElementById("copyOption").addEventListener('click', (e)=>{
	document.getElementById("contextMenu").style.display = 'none';
	console.log("copy");
	copy_value = parseInt(document.getElementById(`cell-${horizontal}-${vertical}`).innerText);
	if(isNaN(copy_value))
	{
		console.log("It can not copy grid ");
	}
	copied_cell = clicked_cell;
	selectedGroup = data.filter(d => d.value === copy_value || d.grpId === data[copy_value -1].grpId);
	isCopied = true;
});
document.getElementById("pasteOption").addEventListener('click', (e)=>{
	console.log("paste");
	//var rows = parseInt(document.getElementById("rows").value);
	//var cols = parseInt(document.getElementById("cols").value);
	if(copied_cell == null)
	{
		console.log("There is nothing to paste");
	}
	else
	{
		let rowOffset =  clicked_cell.row - copied_cell.row;
		let colOffset =  clicked_cell.column - copied_cell.column;
		let canPlace = true;
		for(let groupCell of selectedGroup){
			let {leftTopRow, leftTopCol, rightTopRow, rightTopCol} = groupCell;
			console.log(leftTopRow + rowOffset, leftTopCol + colOffset , rightTopRow + rowOffset , rightTopCol + colOffset , (canPlaceGrid(leftTopRow + rowOffset, leftTopCol + colOffset, rightTopRow + rowOffset, rightTopCol + colOffset) == false)) ;

			if (leftTopRow + rowOffset < 0 || leftTopCol + colOffset < 0 || rightTopRow + rowOffset >= rows || rightTopCol + colOffset >= cols || (canPlaceGrid(leftTopRow + rowOffset, leftTopCol + colOffset, rightTopRow + rowOffset, rightTopCol + colOffset) == false)) {
				canPlace = false;
				break;
			}
		}
		if(canPlace) {
			selectedGroup.forEach(groupCell => {
				const newCell = ({
					leftTopRow: groupCell.leftTopRow + rowOffset,
					leftTopCol: groupCell.leftTopCol + colOffset,
					rightTopRow: groupCell.rightTopRow + rowOffset,
					rightTopCol: groupCell.rightTopCol + colOffset,
					value: data.length + 1,
					color: groupCell.color,
					grpId: groupCell.grpId 
				})
				placedGrid(newCell.leftTopRow, newCell.leftTopCol, newCell.rightTopRow, newCell.rightTopCol, newCell.value, newCell.color);
				data.push(newCell);
			})
		}
		else{
			console.log("Grid can not be paste here");
		}
	}	
	isCopied = false;			
});
document.getElementById("newGroup").addEventListener('click', (e)=>{
	recentGroupId = getRandomGroupId()
	if(data[addInGroupVal-1].grpId == null){
		data[addInGroupVal-1].grpId = recentGroupId;
	}
	else{
		selectedGroup = data.filter(d => d.grpId === data[addInGroupVal-1].grpId);
		selectedGroup.forEach(groupMember => {
			groupMember.grpId = recentGroupId;
		})
	}
	console.log(data[addInGroupVal-1]);
});

document.getElementById("addObjects").addEventListener('click', (e)=>{
	if(recentGroupId == 0){
		console.log("no new group is created");
	}
	else{
		if(data[addInGroupVal-1].grpId == null){
			data[addInGroupVal-1].grpId = recentGroupId;
			console.log(data[addInGroupVal-1]);
		}
		else{
			selectedGroup = [];
			selectedGroup = data.filter(d => d.grpId === data[addInGroupVal-1].grpId);
			selectedGroup.forEach(groupMember => {
				groupMember.grpId = recentGroupId;
			})
			console.log(data[addInGroupVal-1]);
		}
	}	
});

const context_menu = document.querySelector(".nested_menu");
context_menu.addEventListener("mouseenter", (e) => {
	context_menu.innerHTML = '';
	for(i = 0;i < data.length; i++){
		const item = document.createElement("div");
		item.textContent = "grid"+data[i].value;
		context_menu.appendChild(item);
	}
});

const nestedMenuOptions = document.querySelectorAll(".nested_menu");

nestedMenuOptions.forEach(options => {
	options.addEventListener('click', (e) =>{
		console.log("came");
		hlGrid = e.target.textContent;
		hlGrid = hlGrid[hlGrid.length -1];
		highlightGrid(hlGrid);
	})
});

function highlightGrid(val){
	for(let i = data[val-1].leftTopRow; i <= data[val-1].rightTopRow; i++){
		for(let j = data[val-1].leftTopCol; j <= data[val-1].rightTopCol; j++){
			const cell = document.getElementById(`cell-${i}-${j}`);
			//cell.style.border = "10 px solid black";
			cell.style.boxShadow = "0 0 5px 2px black"
		}
	}
}

function resetGrid(val){
	if(!isNaN(hlGrid)){
		//console.log(hlGrid);
		for(let i = data[val-1].leftTopRow; i <= data[val-1].rightTopRow; i++){
			for(let j = data[val-1].leftTopCol; j <= data[val-1].rightTopCol; j++){
				const cell = document.getElementById(`cell-${i}-${j}`);
				cell.style.boxShadow = "0 0 0 0"
			}
		}
	}
	hlGrid = NaN;
}
function placedGrid(minRow,minCol,maxRow,maxCol,value,color)
{
	if(!isNaN(hlGrid)){
		resetGrid(hlGrid);
	}
	for(let i=minRow; i <= maxRow ; i++)
	{ 
		for(let j=minCol; j <= maxCol; j++)
		{
			const cell = document.getElementById(`cell-${i}-${j}`);
			cell.innerText = value;
			cell.style.color = color;
			cell.style.backgroundColor = color;
			cell.classList.remove('selected');	
			cell.setAttribute('draggable','true')
		}
	}
}   
// canpPlaceGrid => int => int => int => int => bool
function canPlaceGrid(minRow,minCol,maxRow,maxCol) 
{
	for(let i=minRow; i <= maxRow ; i++)
	{ 
		for(let j=minCol; j <= maxCol; j++)
		{
			// info : int 
			var info = parseInt(document.getElementById(`cell-${i}-${j}`).innerText);
			if(!isNaN(info))
			{
				return false;
			}                
		}
	}
	return true;
}
function canPlaceGridOnDrop(minRow,minCol,maxRow,maxCol,val) 
{
	for(let i=minRow; i <= maxRow ; i++)
	{ 
		for(let j=minCol; j <= maxCol; j++)
		{
			// info : int 
			var info = parseInt(document.getElementById(`cell-${i}-${j}`).innerText);
			if(!isNaN(info)){
				if(val.indexOf(info) === -1)
				{
					return false;
				}
			}	
		}            
	}
	return true;
}
function getRandomColor() 
{
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) 
	{   
		color = color + letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
function getRandomGroupId()
{
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var gId = '';
        for(var i = 0; i < 2; i++)
        {
                gId = gId + letters[Math.floor(Math.random() * 16)];
        }
        return gId;
}
function saveTable()
{
	var rows = parseInt(document.getElementById("rows").value);
	var cols = parseInt(document.getElementById("cols").value);  	
	var tableState = {
		total_rows : rows,
		total_cols : cols,
		data : data
	}
	localStorage.setItem('tableState', JSON.stringify(tableState));
	console.log(tableState);
}
function loadTable(){
	var loadState = JSON.parse(localStorage.getItem('tableState'));
	data = loadState.data ; 
	document.getElementById("rows").value = loadState.total_rows;
	document.getElementById("cols").value = loadState.total_cols;
	createTable();
}
