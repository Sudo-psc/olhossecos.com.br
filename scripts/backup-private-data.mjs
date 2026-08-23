import { runPrivateDataBackup } from "../ops/backup/backup-private-data.mjs";

const result = await runPrivateDataBackup();
console.log(result.destinationDirectory);
