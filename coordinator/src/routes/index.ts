import convertPrescriptionRoutes from "./debug/convert"
import testOdsRoutes from "./debug/test-ods"
import preparePrescriptionRoutes from "./prescribe/prepare"
import processPrescriptionRoutes from "./process"
import statusRoutes from "./health/get-status"
import pollingRoutes from "./prescribe/polling"
import releaseRoutes from "./dispense/release"
import taskRoutes from "./dispense/task"

export default [
  ...convertPrescriptionRoutes,
  ...testOdsRoutes,
  ...preparePrescriptionRoutes,
  ...processPrescriptionRoutes,
  ...releaseRoutes,
  ...statusRoutes,
  ...pollingRoutes,
  ...taskRoutes
]
