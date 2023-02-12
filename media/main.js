function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("fileLinesTable");
    switching = true;
    // 设置排序方向：默认为升序
    dir = "asc"; 
    while (switching) {
      switching = false;
      rows = table.getElementsByTagName("TR");
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        // always not switch last row
        if (i === rows.length - 2) {
          continue;
        }
        if (dir === "asc") {
          // 分别考虑数字和字符串的情况
          // if x.innerHTML can be converted to a number, then compare as numbers
          if (!isNaN(x.innerHTML) && !isNaN(y.innerHTML)) {
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
              shouldSwitch= true;
              break;
            }
          // if x.innerHTML cannot be converted to a number, then compare as strings
          } else {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
              shouldSwitch= true;
              break;
            }
          }


        } else if (dir === "desc") {
          if (!isNaN(x.innerHTML) && !isNaN(y.innerHTML)) {
            if (Number(x.innerHTML) < Number(y.innerHTML)) {
              shouldSwitch= true;
              break;
            }
          } else {
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
              shouldSwitch= true;
              break;
            }
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++; 
      } else {
        if (switchcount === 0 && dir === "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }

  function refresh (newtable) {
    var table = document.getElementById("fileLinesTableBody");
    table.innerHTML = newtable;
  }
  
  // 设置表头的点击事件，点击时对相应列进行排序
  var headerCells = document.getElementById("fileLinesTable").getElementsByTagName("TH");
  for (var i = 0; i < headerCells.length; i++) {
    headerCells[i].onclick = function() {
      sortTable(this.cellIndex);
    };
  }
  
  window.addEventListener("message" , event => {
    switch (event.data.command) {
      case "refresh":
        refresh(event.data.tablevalue);
        break;
      default:
        break;
    }
  });
