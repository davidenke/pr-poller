export interface PullRequest {
  title: string;
  description: string;
  reviewers: {
    approved: boolean;
  }[];
}
