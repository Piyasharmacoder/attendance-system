import Leave from '../models/Leave.js';

// 🔹 Apply Leave
export const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "Dates required" });
    }

    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({
        message: "Invalid date range"
      });
    }

    const existing = await Leave.findOne({
      user: req.user.id,
      fromDate,
      toDate
    });

    if (existing) {
      return res.status(400).json({
        message: "Leave already applied"
      });
    }

    const leave = await Leave.create({
      user: req.user.id,
      fromDate,
      toDate,
      reason
    });

    res.json(leave);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 Update Leave (Approve / Reject)
export const updateLeave = async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ Validation
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findById(req.params.id).populate('user');

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // 🔐 Role-based control
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔥 Manager restriction (optional but strong)
    if (req.user.role === 'manager') {
      // agar tumhare User model me managerId hai to use karo
      // if (leave.user.managerId.toString() !== req.user.id) {
      //   return res.status(403).json({ message: "Not your team" });
      // }
    }

    leave.status = status;

    await leave.save();

    res.json({
      message: `Leave ${status}`,
      leave
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};