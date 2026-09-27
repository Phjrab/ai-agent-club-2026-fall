import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {root,contentDigest,loadLecture} from '../scripts/lib.mjs';

// Test the public renderer without changing the real publication approval.
export function createPublicFixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lecture-public-test-'));
 for(const name of ['scripts','src','lectures','docs','package.json','course.config.json'])
  fs.cpSync(path.join(root,name),path.join(dir,name),{recursive:true});
 fs.symlinkSync(path.join(root,'node_modules'),path.join(dir,'node_modules'),'dir');
 const lecture=path.join(dir,'lectures','2026-fall','01-agent-ai-intro');
 const approval={schemaVersion:1,status:'approved',approvedContentDigest:contentDigest(loadLecture(lecture)),approvedAt:'2026-09-25T00:00:00Z',approvalEvidence:'AUTOMATED TEST FIXTURE ONLY — not a publication approval',scope:{site:true,repositorySource:true,includeSpeakerNotesInRepository:true,pdf:false}};
 fs.writeFileSync(path.join(lecture,'publication.approval.json'),JSON.stringify(approval,null,2)+'\n');
 return dir;
}
