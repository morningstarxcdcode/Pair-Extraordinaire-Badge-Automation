# Pair Extraordinaire Badge Automation

GitHub Account: morningstarxcdcode  
Repository URL: https://github.com/morningstarxcdcode/Pair-Extraordinaire-Badge-Automation

This project automates the creation and merging of pull requests with coauthored commits to help you earn the "Pair Extraordinaire" badge on GitHub without having real coauthors.

## How It Works

- A GitHub Action workflow runs a Node.js script.
- The script creates a commit with a coauthor trailer (can be a fake coauthor).
- It pushes the commit to a new branch.
- It opens a pull request from that branch.
- It merges the pull request automatically.
- This process can be repeated to create multiple merged PRs to qualify for the badge.

## Setup

1. Fork or create a repository where you want to run this automation.

2. Create a GitHub Personal Access Token (PAT) with `repo` permissions.

3. Add the PAT as a secret named `GITHUB_TOKEN` in your repository settings.

4. Commit and push the workflow and script files to your repository.

## Usage

- Trigger the workflow manually from the "Actions" tab in your repository or wait for the scheduled run.

- The workflow will create and merge multiple pull requests per run (default 5).

- Run the workflow multiple times (or adjust the script) to create the required number of merged PRs (about 49) to earn the badge.

## Configuration

- You can adjust the number of PRs created per workflow run by setting the `PRS_PER_RUN` environment variable.

- You can adjust the delay between PR creations by setting the `DELAY_MS` environment variable (in milliseconds).

## Notes

- Use responsibly to avoid triggering GitHub spam detection or account suspension.

- This project is for educational and experimental purposes.

## License

MIT License
