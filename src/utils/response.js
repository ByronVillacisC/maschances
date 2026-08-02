function ok(res, data) {
  res.json({ success: true, data });
}

function error(res, message, code = 400) {
  res.status(code).json({ success: false, message });
}

module.exports = { ok, error };