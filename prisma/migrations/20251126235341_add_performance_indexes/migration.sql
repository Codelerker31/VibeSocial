-- CreateIndex
CREATE INDEX "Comment_projectId_parentId_idx" ON "Comment"("projectId", "parentId");

-- CreateIndex
CREATE INDEX "Interaction_projectId_type_idx" ON "Interaction"("projectId", "type");

-- CreateIndex
CREATE INDEX "Interaction_userId_projectId_type_idx" ON "Interaction"("userId", "projectId", "type");

-- CreateIndex
CREATE INDEX "Project_status_engagementScore_idx" ON "Project"("status", "engagementScore");

-- CreateIndex
CREATE INDEX "Project_userId_status_idx" ON "Project"("userId", "status");
