export default function profileCompletion(user, p) {
  const careers = p.careerProfiles || [];
  const skillCount = careers.reduce((n, c) => n + Object.values(c.skills?.toObject?.() ?? c.skills ?? {}).reduce((x, a) => x + (Array.isArray(a) ? a.length : 0), 0), 0);
  const checks = [['Name', !!user.name], ['Phone', !!p.phone], ['Location', !!p.location], ['Career fields', careers.length > 0], ['Skills', skillCount >= 3],
    ['Experience or education', careers.some((c) => c.experience?.length || c.education?.length)], ['Projects', careers.some((c) => c.projects?.length)], ['Target roles', careers.some((c) => c.targetRoles?.length)]];
  const done = checks.filter(([, ok]) => ok).length;
  return { percent: Math.round((done / checks.length) * 100), missing: checks.filter(([, ok]) => !ok).map(([l]) => l) };
}
