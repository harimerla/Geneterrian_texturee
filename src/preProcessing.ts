// import * as fs from 'fs';
const fs = require('fs');
const csvtojson=require("csvtojson");
//import('ag-grid-community')
import('ag-grid-enterprise')
// import { Grid } from 'ag-grid-community';
import { DomLayoutType, Grid, GridOptions } from 'ag-grid-community';

var samples: string[] = []

function setSelection(selection){
  samples = selection;
}

export function getSelection(){
  return samples;
}

async function getPlotlyScript() {
    // fetch
    const plotlyRes = await fetch('https://cdn.plot.ly/plotly-latest.js')
    // get response as text
    return await plotlyRes.text() 
  } 

function getChartState (data, layout) {
    const el = document.getElementById('canvas-div')
    return {
      data: data, // current data
      layout: layout // current layout
    }
  }

  async function getHtml(anchor) {
  
    return `
        <head>
          <meta charset="utf-8" />
        </head>
        <img src=${anchor}></img>
    `
    // <div id="plotly-output"><img src=""></div>
  }

  export async function exportToHtml (anchor) {
    // Create URL
    const blob = new Blob([await getHtml(anchor)], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
  
    // Create downloader
    // const downloader = document.getElementById(id) as HTMLAnchorElement;
    const downloader = document.createElement('a')
    downloader.href = url
    downloader.download = 'export.html'
    console.log('a tag: '+url);
  
    // Trigger click
    downloader.click()

  
    // Clean up
    URL.revokeObjectURL(url)
  }
  
export function preProcessExpData(expData){
  var data=new Map<string, any>();
  var fields = Object.keys(expData[0])
  for(var i=0;i<expData.length;i++){
    data[expData[i][fields[0]]] = expData[i]
  }
  return data;
}

export function getExpData(expData, layoutData, selection){
  var expMap = new Map<string, any>();
  var colNames = expData[Object.keys(expData)[0]];
  console.log('colnames length '+colNames.size);
  var fields = Object.keys(expData[Object.keys(expData)[0]]);
  //var fields = Object.keys(expData);
  console.log('fields length'+fields.length)
  console.log(selection.length)
  for(var k=0;k<selection.length;k++){
    var row = expData[selection[k]];
    for(var i=1;i<fields.length;i++){
      // console.log('each row: '+expData[0][fields[i]])
      if(k!=0)
      console.log('row sdkvhbjkhfdbvdfhkjbvdf '+expMap[colNames[fields[i]]]+" "+row[fields[i]])
      if(k==0)
        expMap[colNames[fields[i]]]=+row[fields[i]];
      else if(k!=selection.length-1)
        expMap[colNames[fields[i]]]=expMap[colNames[fields[i]]]+(+row[fields[i]]);
      else
        expMap[colNames[fields[i]]]=(expMap[colNames[fields[i]]]+(+row[fields[i]]))/(k+1);
    }
  }
  // for(var k=0;k<selection.length;k++){
  //   for(var i=1;i<Object.keys(expData[0]).length;i++){
  //     // console.log('each row: '+expData[0][fields[i]])
  //     expMap[expData[0][fields[i]]]=expData[selection[k]+1][fields[i]];
  //   }
  // }
  console.log(Object.keys(expMap));
  console.log(expMap['SULT4A1']);
  console.log('SULT4A1' in expMap);
  var map=new Map<string,any>();
  fields = Object.keys(layoutData[0]);
  for(var i=1;i<Object.keys(layoutData).length;i++){
    //console.log(expMap.has('SULT4A1'));
    if((layoutData[i][fields[0]]) in expMap){
        var row=layoutData[i];
        //console.log(row[fields[0]])
        map[row[fields[0]]]=[row[fields[0]],+row[fields[1]],+row[fields[2]],expMap[row[fields[0]]]];
      }
    }
    return map;
}

export function getExpData1(expData, layoutData, select){
  var layoutMap=new Map<string,any>();
  var fields = Object.keys(layoutData[0]);
  for(var i=1;i<Object.keys(layoutData).length;i++){
    //console.log(expMap.has('SULT4A1'));
      var row=layoutData[i];
      //console.log(row[fields[0]])
      layoutMap[row[fields[0]]]=[row[fields[0]],+row[fields[1]],+row[fields[2]],0];
  }
  //console.log('layout map: '+Object.keys(layoutMap))
  // console.log('layout map: '+layoutMap['PALM'])
  var map = new Map<string, any>();
  // console.log('exp data'+expData);
  // console.log(Object.keys(expData));
  var colNames = expData[Object.keys(expData)[0]];
  // console.log(colNames)
  // console.log('colnames length '+Object.keys(colNames));
  var fields = Object.keys(expData[Object.keys(expData)[0]]);
  // console.log('fields length'+fields)
    var row = expData[select];
    for(var i=1;i<fields.length;i++){
      //console.log('row sdkvhbjkhfdbvdfhkjbvdf '+map[colNames[fields[i]]]+" "+row[fields[i]])
      if(colNames[fields[i]] in layoutMap)
        var row = layoutMap[colNames[fields[i]]]
        // console.log(colNames[fields[i]])
        // console.log('row'+row)
        row[3]=+expData[select][fields[i]]
        map[colNames[fields[i]]]=row;
  }
  return map
}

export function getData(map, index){

}

export async function getAGPLOT(selection: string[]){
  var path = './clinical_Data_GBM.csv';
  var data, fileContent;
  var reader = new FileReader();
  const response: Response = await fetch(path);
  await response.text().then(d=>{
    // console.log('response '+d);
    fileContent=d;
  })
  await csvtojson({noheader:true}).fromString(fileContent).then((jsonObjectArray) => {
    data = jsonObjectArray;
  })
  .catch((error) => {
    console.error(error);
  });
  // var rowData = data;
  const columnDefs = [
    { field: 'SampleID',checkboxSelection: true, filter: 'agSetColumnFilter'},
    { field: 'Overal_Survival_Days', filter:'agNumberColumnFilter'},
    { field: 'Overal_Survival_Status', filter:'agNumberColumnFilter'},
    { field: 'GBM_Subtype', filter: 'agSetColumnFilter'},
    { field: 'Age_at_GBM_Diagnosis', filter:'agNumberColumnFilter' },
  ];
  
  // specify the data
  var rowData = [];
  var fields = Object.keys(data[0]);
  for(var i=1;i<data.length;i++){
    var row = data[i];
    rowData.push({SampleID: data[i][fields[0]],
      Overal_Survival_Days: +data[i][fields[1]],
      Overal_Survival_Status: +data[i][fields[2]],
      GBM_Subtype: data[i][fields[3]],
      Age_at_GBM_Diagnosis: +data[i][fields[4]],
    })
    // rowData.push({SampleID: 1,
    //   Overal_Survival_Days: 2,
    //   Overal_Survival_Status: 3,
    //   GBM_Subtype: 4,
    //   Age_at_GBM_Diagnosis: 5,
    // })
  }
  // let the grid know which columns and what data to use
  /** @type {import('ag-grid-community').GridOptions} */
  var gridDiv=document.querySelector("#myGrid") as HTMLElement;
  const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    // defaultColDef: {
    //   flex: 1,
    //   minWidth: 100,
    //   filter: true,
    //   resizable: true,
    //   enableRowGroup: true,
    // },
    rowSelection: 'multiple',
    autoGroupColumnDef: {
      minWidth: 200,
      filter: 'agGroupColumnFilter',
    },
    animateRows: true,
    sideBar: 'filters',
    groupSelectsChildren: true,
    suppressHorizontalScroll: true,
    defaultColDef: {
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
      width: 100,
      sortable: true,
      resizable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      editable: true,
    },
    pagination: true,
    paginationPageSize: 10,
    // paginationAutoPageSize:true,
    domLayout: 'autoHeight',
    //suppressHorizontalScroll: true
    // getRowId: (params) => params.data.id,
  } as GridOptions;
  // const rowHeight = api.getRowNode('0').rowHeight;
  // const rowCount = api.getDisplayedRowCount();
  // const containerHeight = rowHeight * rowCount;
  // gridDiv.style.height = containerHeight + 'px';
  new Grid(gridDiv, gridOptions);
  gridDiv.addEventListener('change',()=>{
    const selectedRows = gridOptions.api.getSelectedRows();
    console.log(selectedRows)
    console.log(selectedRows[selectedRows.length-1]['SampleID'])
    //selection.push(selectedRows[selectedRows.length-1]['SampleID'])
    for(row of selectedRows){
      selection.push(row['SampleID'])
    }
    console.log('updated selection: '+selection)
    setSelection(selection)
    //selection=temp.slice();
    //console.log(selection)
    //selection = selectedRows;
  })
  // gridDiv.scrollTo(0, gridDiv.scrollHeight)
  // gridDiv.style.height = 40.36*rowData.length+'px';
  // gridDiv.style.overflow = 'scroll';

  gridDiv.style.height = '60%'; // Set the desired height of the grid container
  gridDiv.style.width = '100%';
  gridDiv.style.overflow = 'auto';
  console.log(gridDiv.offsetHeight)
  console.log(gridOptions.api.getRowNode('0').rowHeight)
}

