import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// 🔹 GET REPORT (FILTER + ROLE BASED)
export const getReport = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    let filter = {};

    // 📅 Date filter
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // 🔐 ROLE BASED
    if (req.user.role === 'employee') {
      filter.user = req.user._id;
    }

    else if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');

      const teamIds = team.map(u => u._id);
      teamIds.push(req.user._id);

      if (userId && teamIds.some(id => id.toString() === userId)) {
        filter.user = userId;
      } else {
        filter.user = { $in: teamIds };
      }
    }

    else if (req.user.role === 'admin' && userId) {
      filter.user = userId;
    }

    const data = await Attendance.find(filter)
      .populate('user', 'name email role')
      .sort({ date: -1 });

    res.json({ success: true, data });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 EXPORT EXCEL
export const exportExcel = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    let filter = {};

    // 📅 Date filter
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // 🔐 ROLE BASED ACCESS

    // 👤 Employee → only own data
    if (req.user.role === 'employee') {
      filter.user = req.user._id;
    }

    // 👨‍💼 Manager → team + self
    else if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');

      const teamIds = team.map(u => u._id);
      teamIds.push(req.user._id);

      if (userId && teamIds.some(id => id.toString() === userId)) {
        filter.user = userId;
      } else {
        filter.user = { $in: teamIds };
      }
    }

    // 👑 Admin → all OR specific user
    else if (req.user.role === 'admin' && userId) {
      filter.user = userId;
    }

    // 🔥 FETCH DATA
    const data = await Attendance.find(filter)
      .populate('user', 'name email role')
      .sort({ date: -1 });

    // 📊 EXCEL CREATE
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Punch In', key: 'punchIn', width: 25 },
      { header: 'Punch Out', key: 'punchOut', width: 25 },
      { header: 'Working Hours', key: 'hours', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Selfie', key: 'selfie', width: 30 },
      { header: 'Location', key: 'location', width: 30 }
    ];

    // Header style
    sheet.getRow(1).font = { bold: true };

    // 🔥 DATA INSERT
    data.forEach(d => {
      sheet.addRow({
        name: d.user?.name || 'N/A',
        date: d.date ? new Date(d.date).toLocaleDateString() : 'N/A',
        punchIn: d.punchIn?.time
          ? new Date(d.punchIn.time).toLocaleString()
          : 'N/A',
        punchOut: d.punchOut?.time
          ? new Date(d.punchOut.time).toLocaleString()
          : 'N/A',
        hours: d.workingHours ?? 0,
        status: d.status || 'N/A',
        selfie: d.punchIn?.selfie || 'N/A',
        location: d.punchIn?.location
          ? `${d.punchIn.location.lat}, ${d.punchIn.location.lng}`
          : 'N/A'
      });
    });

    // 📥 DOWNLOAD RESPONSE
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=attendance_report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 EXPORT PDF
export const exportPDF = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    let filter = {};

    // 📅 Date filter
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // 🔐 ROLE BASED ACCESS

    if (req.user.role === 'employee') {
      filter.user = req.user._id;
    }

    else if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');

      const teamIds = team.map(u => u._id);
      teamIds.push(req.user._id);

      if (userId && teamIds.some(id => id.toString() === userId)) {
        filter.user = userId;
      } else {
        filter.user = { $in: teamIds };
      }
    }

    else if (req.user.role === 'admin' && userId) {
      filter.user = userId;
    }

    const data = await Attendance.find(filter)
      .populate('user')
      .sort({ date: -1 });

    const doc = new PDFDocument({ margin: 30 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=attendance_report.pdf'
    );

    doc.pipe(res);

    doc.fontSize(18).text('Attendance Report', { align: 'center' });
    doc.moveDown();

    data.forEach(d => {
      doc.fontSize(12).text(`Name: ${d.user?.name || 'N/A'}`);
      doc.text(`Date: ${new Date(d.date).toLocaleDateString()}`);
      doc.text(`Punch In: ${d.punchIn?.time ? new Date(d.punchIn.time).toLocaleString() : 'N/A'}`);
      doc.text(`Punch Out: ${d.punchOut?.time ? new Date(d.punchOut.time).toLocaleString() : 'N/A'}`);
      doc.text(`Working Hours: ${d.workingHours ?? 0}`);
      doc.text(`Status: ${d.status || 'N/A'}`);
      doc.text(`Selfie: ${d.punchIn?.selfie || 'N/A'}`);
      doc.text(`Location: ${
        d.punchIn?.location
          ? `${d.punchIn.location.lat}, ${d.punchIn.location.lng}`
          : 'N/A'
      }`);

      doc.moveDown();
      doc.moveTo(30, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
    });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};