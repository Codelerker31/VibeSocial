-- CreateMaterializedView
CREATE MATERIALIZED VIEW "project_scores" AS
SELECT
    p.id AS "projectId",
    (
        (COALESCE(saves.count, 0) * 50) +
        (COALESCE(replies.count, 0) * 40) +
        (COALESCE(demo_clicks.count, 0) * 25) +
        (COALESCE(long_views.count, 0) * 20) +
        (COALESCE(long_comments.count, 0) * 15) +
        (COALESCE(shares.count, 0) * 5) +
        (COALESCE(likes.count, 0) * 1)
    )::float AS "engagementScore",
    EXP(-EXTRACT(EPOCH FROM (NOW() - p."submittedAt")) / (30 * 86400))::float AS "recencyFactor",
    (
        (
            (COALESCE(saves.count, 0) * 50) +
            (COALESCE(replies.count, 0) * 40) +
            (COALESCE(demo_clicks.count, 0) * 25) +
            (COALESCE(long_views.count, 0) * 20) +
            (COALESCE(long_comments.count, 0) * 15) +
            (COALESCE(shares.count, 0) * 5) +
            (COALESCE(likes.count, 0) * 1)
        ) * EXP(-EXTRACT(EPOCH FROM (NOW() - p."submittedAt")) / (30 * 86400))
    )::float AS "finalScore",
    NOW() AS "lastUpdated"
FROM "Project" p
LEFT JOIN (
    SELECT "projectId", COUNT(*) as count FROM "Interaction" WHERE type = 'SAVE' GROUP BY "projectId"
) saves ON p.id = saves."projectId"
LEFT JOIN (
    SELECT "projectId", COUNT(*) as count FROM "Interaction" WHERE type = 'CLICK_DEMO' GROUP BY "projectId"
) demo_clicks ON p.id = demo_clicks."projectId"
LEFT JOIN (
    SELECT "projectId", COUNT(*) as count FROM "Interaction" WHERE type = 'SHARE' GROUP BY "projectId"
) shares ON p.id = shares."projectId"
LEFT JOIN (
    SELECT "projectId", COUNT(*) as count FROM "Interaction" WHERE type = 'LIKE' GROUP BY "projectId"
) likes ON p.id = likes."projectId"
LEFT JOIN (
    SELECT "projectId", COUNT(*) as count FROM "Interaction" WHERE type = 'VIEW' GROUP BY "projectId" 
) long_views ON p.id = long_views."projectId"
LEFT JOIN (
    SELECT c."projectId", COUNT(*) as count 
    FROM "Comment" c 
    JOIN "Project" p2 ON c."projectId" = p2.id 
    WHERE c."userId" = p2."userId" AND c."parentId" IS NOT NULL 
    GROUP BY c."projectId"
) replies ON p.id = replies."projectId"
LEFT JOIN (
    SELECT "projectId", COUNT(*) as count FROM "Comment" GROUP BY "projectId"
) long_comments ON p.id = long_comments."projectId"
WHERE p.status = 'APPROVED';

CREATE UNIQUE INDEX project_scores_id ON "project_scores" ("projectId");
CREATE INDEX project_scores_final_score ON "project_scores" ("finalScore" DESC);