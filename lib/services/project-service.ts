import { z } from "zod";
import { insertProject, listProjectsForUser, getProjectForUser } from "@/lib/db/queries/projects";
import { createId } from "@/lib/utils/ids";
import { assertPublicHttpUrl } from "@/lib/utils/urls";

const CreateProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  rootUrl: z.string().trim().min(1).max(2048)
});

export async function createProject(userId: string, raw: unknown) {
  const input = CreateProjectSchema.parse(raw);
  const rootUrl = await assertPublicHttpUrl(input.rootUrl);
  return insertProject({
    id: createId("proj"),
    user_id: userId,
    name: input.name,
    root_url: rootUrl,
    created_at: new Date().toISOString()
  });
}

export async function getProjectsForUser(userId: string) {
  return listProjectsForUser(userId);
}

export async function requireProjectForUser(projectId: string, userId: string) {
  const project = await getProjectForUser(projectId, userId);
  if (!project) throw Object.assign(new Error("Project not found"), { status: 404 });
  return project;
}
