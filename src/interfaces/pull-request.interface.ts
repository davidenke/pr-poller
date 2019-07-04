export interface PullRequest {
  title: string;
  description: string;
  reviewers: {
    name: string;
    approved: boolean;
  }[];
}
