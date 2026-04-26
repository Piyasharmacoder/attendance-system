import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Overtime from '../models/Overtime.js';

// Employee Dashboard
export const getMyDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            startDate,
            endDate,
            type,
            status,
            overtime,
            minHours,
            maxHours,
            geoStatus,
            sort = 'desc'
        } = req.query;

        const filter = { user: userId };

        // 📅 Date Filter
        if (startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        }

        // ⏱ Week / Month
        if (type) {
            const today = new Date();
            let start = new Date();

            if (type === 'week') start.setDate(today.getDate() - 7);
            if (type === 'month') start.setMonth(today.getMonth() - 1);

            filter.createdAt = { $gte: start };
        }

        // 📊 Status
        if (status) filter.status = status;

        // ⏱ Working hours
        if (minHours || maxHours) {
            filter.workingHours = {};
            if (minHours) filter.workingHours.$gte = Number(minHours);
            if (maxHours) filter.workingHours.$lte = Number(maxHours);
        }

        // ⏱ Overtime
        if (overtime === 'true') {
            filter.overtimeHours = { $gt: 0 };
        }

        // 📍 Geo filter
        if (geoStatus) {
            filter["punchIn.geoStatus"] = geoStatus;
        }

        const data = await Attendance.find(filter).sort({
            createdAt: sort === 'asc' ? 1 : -1
        });

        // 🔥 LEAVE LOGIC 
const leaves = await Leave.find({ user: userId });

const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;


        // 🔥 Summary
        let totalDays = data.length;
        let totalHours = 0;
        let overtimeCount = 0;

        data.forEach(d => {
            totalHours += d.workingHours || 0;
            if (d.overtimeHours > 0) overtimeCount++;
        });

        res.json({
            summary: {
                totalDays,
                totalHours,
                overtimeCount,
                approvedLeaves,
                pendingLeaves
            },
            records: data
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// MANAGER Dashboard
export const getTeamAttendance = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      employeeId,
      overtime,
      geoStatus,
      sort = 'desc'
    } = req.query;

    const team = await User.find({ manager: req.user._id }).select('_id');
    const teamIds = team.map(u => u._id);
    teamIds.push(req.user._id);

    const filter = {
      user: { $in: teamIds }
    };

    // 📅 Date filter
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // 👤 Specific employee
    if (employeeId) {
      const isAllowedUser = teamIds.some(id => id.toString() === employeeId);
      if (!isAllowedUser) {
        return res.status(403).json({ message: "Not your team member" });
      }
      filter.user = employeeId;
    }

    // 📊 Status
    if (status) filter.status = status;

    // ⏱ Overtime
    if (overtime === 'true') {
      filter.overtimeHours = { $gt: 0 };
    }

    // 📍 Geo
    if (geoStatus) {
      filter["punchIn.geoStatus"] = geoStatus;
    }

    const data = await Attendance.find(filter)
      .populate('user')
      .sort({ createdAt: sort === 'asc' ? 1 : -1 });

    // 🔥 UNIQUE USER IDS
    const userIds = [...new Set(data.map(d => d.user?._id?.toString()).filter(Boolean))];

    // 🔥 LEAVE FETCH (optimized)
    const leaves = await Leave.find({
      user: { $in: userIds }
    });

    // 🔥 LEAVE SUMMARY
    const totalLeaves = leaves.length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

    // 🔥 EMPLOYEE-WISE LEAVE COUNT
    const leaveByUser = {};

    leaves.forEach(l => {
      if (l.status === 'Approved') {
        const uid = l.user?.toString();
        if (!uid) return;

        if (!leaveByUser[uid]) leaveByUser[uid] = 0;
        leaveByUser[uid]++;
      }
    });

    // 🔥 SUMMARY CALCULATION
    const totalEmployeesSet = new Set();
    const presentUsers = new Set();

    let totalHours = 0;
    let overtimeCount = 0;

    const today = new Date().toISOString().split("T")[0];

    data.forEach(d => {
      const uid = d.user?._id?.toString();
      if (!uid) return;

      totalEmployeesSet.add(uid);

      totalHours += d.workingHours || 0;

      if (d.overtimeHours > 0) overtimeCount++;

      if (d.date && new Date(d.date).toISOString().split("T")[0] === today) {
        presentUsers.add(uid);
      }
    });

    const summary = {
      totalEmployees: totalEmployeesSet.size,
      presentToday: presentUsers.size,
      totalHours,
      overtimeCount,
      totalLeaves,
      approvedLeaves,
      pendingLeaves
    };

    res.json({
      summary,
      records: data,
      leaveByUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//ADMIN DASHBOARD CONTROLLER
export const getAdminDashboard = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            role,
            status,
            overtime,
            geoStatus,
            userId,
            sort = 'desc'
        } = req.query;

        // 🔹 USER FILTER
        const userFilter = {};
        if (role) userFilter.role = role;

        const users = await User.find(userFilter);

        // 🔹 ATTENDANCE FILTER
        const filter = {};

        if (userId) filter.user = userId;

        if (startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        }

        if (status) filter.status = status;

        if (overtime === 'true') {
            filter.overtimeHours = { $gt: 0 };
        }

        if (geoStatus) {
            filter["punchIn.geoStatus"] = geoStatus;
        }

        const attendance = await Attendance.find(filter)
            .populate('user')
            .sort({ createdAt: sort === 'asc' ? 1 : -1 });

        // 🔥 SUMMARY CALCULATIONS
        let totalUsers = users.length;
        let totalEmployees = users.filter(u => u.role === 'employee').length;
        let totalManagers = users.filter(u => u.role === 'manager').length;

        let totalAttendance = attendance.length;
        let totalHours = 0;
        let overtimeCount = 0;
        const presentTodayUsers = new Set();

        const today = new Date().toISOString().split("T")[0];

        attendance.forEach(d => {
            totalHours += d.workingHours || 0;

            if (d.overtimeHours > 0) overtimeCount++;

            const uid = d.user?._id?.toString();
            if (
              uid &&
              d.date &&
              new Date(d.date).toISOString().split("T")[0] === today
            ) {
              presentTodayUsers.add(uid);
            }
        });


        // 🔥 LEAVE CALCULATIONS (yaha add karo)
        const totalLeaves = await Leave.countDocuments();
        const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });


        const summary = {
            totalUsers,
            totalEmployees,
            totalManagers,
            totalAttendance,
            totalHours,
            overtimeCount,
            presentToday: presentTodayUsers.size,
            totalLeaves,
            approvedLeaves,
            pendingLeaves
        };

        res.json({
            summary,
            users,
            attendance
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};