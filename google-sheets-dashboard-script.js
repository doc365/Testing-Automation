// ========================================================
// 1. CLEAN RESET & RESTORE DASHBOARD
// ========================================================
function resetAndFormatDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("QA Metrics") || ss.getActiveSheet();
  sheet.setName("QA Metrics");

  // 1. Remove all old charts to eliminate clutter
  var charts = sheet.getCharts();
  for (var i = 0; i < charts.length; i++) {
    sheet.removeChart(charts[i]);
  }

  // 2. Unmerge any stray merged cells on the right
  sheet.getRange("H1:N20").breakApart();
  sheet.getRange("H1:N20").clear({ contentsOnly: true, formatOnly: true });

  // 3. Set standard column widths
  sheet.setColumnWidth(1, 175); // Date & Time
  sheet.setColumnWidth(2, 110); // Status
  sheet.setColumnWidth(3, 85);  // Total Tests
  sheet.setColumnWidth(4, 85);  // Passed
  sheet.setColumnWidth(5, 85);  // Failed
  sheet.setColumnWidth(6, 100); // Duration
  sheet.setColumnWidth(7, 360); // Scenarios
  sheet.setColumnWidth(8, 30);  // Spacer
  sheet.setColumnWidth(9, 130); // KPI Column 1
  sheet.setColumnWidth(10, 130);// KPI Column 2

  // 4. Set Clean Row 1 Headers
  var headers = [["Date & Time (UTC+7)", "Status", "Total Tests", "Passed", "Failed", "Duration", "Failed Scenarios / Errors"]];
  sheet.getRange("A1:G1").setValues(headers)
    .setFontFamily("Roboto, Arial, sans-serif")
    .setFontSize(10)
    .setFontWeight("bold")
    .setFontColor("#FFFFFF")
    .setBackground("#0F172A")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.getRange("G1").setHorizontalAlignment("left");
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);

  // 5. Build Clean Side Widget (Columns I & J)
  // Header
  sheet.getRange("I1:J1").merge()
    .setValue("⚡ SUITE HEALTH SUMMARY")
    .setFontFamily("Roboto, Arial, sans-serif")
    .setFontSize(9)
    .setFontWeight("bold")
    .setFontColor("#64748B")
    .setBackground("#F8FAFC")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // Labels
  sheet.getRange("I2").setValue("PASS RATE").setFontSize(8).setFontWeight("bold").setFontColor("#64748B").setHorizontalAlignment("center").setBackground("#F8FAFC");
  sheet.getRange("J2").setValue("TOTAL RUNS").setFontSize(8).setFontWeight("bold").setFontColor("#64748B").setHorizontalAlignment("center").setBackground("#F8FAFC");
  sheet.getRange("I4").setValue("PASSED").setFontSize(8).setFontWeight("bold").setFontColor("#15803D").setHorizontalAlignment("center").setBackground("#F8FAFC");
  sheet.getRange("J4").setValue("FAILED").setFontSize(8).setFontWeight("bold").setFontColor("#DC2626").setHorizontalAlignment("center").setBackground("#F8FAFC");

  // Safe Formulas (Using native Google Sheets syntax with no delimiter conflicts)
  sheet.getRange("I5").setFormula('=COUNTIF(B2:B, "PASSED")').setFontSize(14).setFontWeight("bold").setFontColor("#16A34A").setHorizontalAlignment("center").setBackground("#F0FDF4");
  sheet.getRange("J5").setFormula('=COUNTIF(B2:B, "FAILED")').setFontSize(14).setFontWeight("bold").setFontColor("#DC2626").setHorizontalAlignment("center").setBackground("#FEF2F2");
  sheet.getRange("J3").setFormula('=I5 + J5').setFontSize(20).setFontWeight("bold").setFontColor("#0F172A").setHorizontalAlignment("center").setBackground("#F8FAFC");
  sheet.getRange("I3").setFormula('=IF(J3=0, "0.0%", TEXT(I5/J3, "0.0%"))').setFontSize(20).setFontWeight("bold").setFontColor("#15803D").setHorizontalAlignment("center").setBackground("#F0FDF4");

  sheet.getRange("I1:J5").setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);

  // 6. Style any existing data rows under Row 1
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2 && sheet.getRange(2, 1).getValue().toString().trim() !== "") {
    for (var r = 2; r <= lastRow; r++) {
      var rowRange = sheet.getRange(r, 1, 1, 7);
      rowRange.setFontFamily("Roboto, Arial, sans-serif").setFontSize(9).setVerticalAlignment("middle");
      sheet.setRowHeight(r, 32);

      var isEven = (r % 2 === 0);
      rowRange.setBackground(isEven ? "#FFFFFF" : "#F8FAFC");
      sheet.getRange(r, 1, 1, 6).setHorizontalAlignment("center");
      sheet.getRange(r, 7).setHorizontalAlignment("left");

      var status = sheet.getRange(r, 2).getValue().toString().trim().toUpperCase();
      var badge = sheet.getRange(r, 2).setFontWeight("bold");
      if (status === "PASSED") {
        badge.setBackground("#DCFCE7").setFontColor("#15803D");
      } else if (status === "FAILED") {
        badge.setBackground("#FEE2E2").setFontColor("#B91C1C");
      }
      rowRange.setBorder(true, true, true, true, false, false, "#F1F5F9", SpreadsheetApp.BorderStyle.SOLID);
    }
  }

  // 7. Mini Chart Helper in K1:L3
  sheet.getRange("K1").setValue("Status");
  sheet.getRange("L1").setValue("Count");
  sheet.getRange("K2").setValue("PASSED");
  sheet.getRange("L2").setFormula('=I5');
  sheet.getRange("K3").setValue("FAILED");
  sheet.getRange("L3").setFormula('=J5');
  sheet.getRange("K1:L3").setFontColor("#E2E8F0").setFontSize(6);

  // Clean Donut Chart positioned under KPI widget
  var chart = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(sheet.getRange("K1:L3"))
    .setPosition(7, 9, 0, 0)
    .setOption("pieHole", 0.6)
    .setOption("colors", ["#16A34A", "#EF4444"])
    .setOption("width", 260)
    .setOption("height", 160)
    .setOption("legend", { position: "bottom" })
    .build();

  sheet.insertChart(chart);
}

// ========================================================
// 2. LIVE WEBHOOK (APPENDS INCOMING TEST RUNS)
// ========================================================
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("QA Metrics") || ss.getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var body = data.body || data;

    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
    var status = (body.status || "UNKNOWN").toUpperCase();
    var duration = (body.durationSeconds || 0) + "s";
    var failedList = (body.failedScenarios || [])
      .map(function (f) { return f.title; })
      .join(", ");

    // Finds the next empty row in Column A
    var nextRow = sheet.getRange("A:A").getValues().filter(String).length + 1;

    sheet.getRange(nextRow, 1, 1, 7).setValues([[
      timestamp,
      status,
      body.totalTests || 0,
      body.passed || 0,
      body.failed || 0,
      duration,
      failedList
    ]]);

    // Style the new row
    var rowRange = sheet.getRange(nextRow, 1, 1, 7);
    rowRange.setFontFamily("Roboto, Arial, sans-serif").setFontSize(9).setVerticalAlignment("middle");
    sheet.setRowHeight(nextRow, 32);

    rowRange.setBackground(nextRow % 2 === 0 ? "#FFFFFF" : "#F8FAFC");
    sheet.getRange(nextRow, 1, 1, 6).setHorizontalAlignment("center");
    sheet.getRange(nextRow, 7).setHorizontalAlignment("left");

    var badge = sheet.getRange(nextRow, 2).setFontWeight("bold");
    if (status === "PASSED") {
      badge.setBackground("#DCFCE7").setFontColor("#15803D");
    } else {
      badge.setBackground("#FEE2E2").setFontColor("#B91C1C");
    }

    rowRange.setBorder(true, true, true, true, false, false, "#F1F5F9", SpreadsheetApp.BorderStyle.SOLID);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
