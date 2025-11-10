# Setting up a Developer Environment

You'll need to install [node.js](https://nodejs.org/en) to get started.

You can mostly follow the [setup instructions](/the-hackku/hackku26_website?tab=readme-ov-file#setup--installation) from the README file but you'll need to get a `.env` file from a tech co-lead.

# Changing Code

> [!WARNING]
> Please make sure to create your own branch before commiting any code. You will not be able to make changes in the `main` branch directly and need to make changes through a pull request from a different branch.

1. Create your own git branch once you have a local working copy. You can name it whatever you want, but its best practice to include your name and feature(s) that you are working on.
   
   This can be done with the following git command:

   ```bash
   git switch -c my-username/my-feature
   ```

2. You should be in the new git branch now. You can check by running `git branch`. The branch you are currently on will be starred.

   ```
     astro_rr
     develop
     initial_site
   * main

   ```

3. Make whatever changes and commits you need to.

4. Once you're done making all the changes you need. Push your code to the GitHub repository with the following git command:

   ```bash
   git push -u origin my-username/my-feature
   ```

5. Go to the [pull request tab](https://github.com/the-hackku/hackku26_website/pulls) in the GitHub repo and create a new pull request with the **base** as `main` and the **compare** as `my-username/my-feature`.

6. Someone will review and merge your changes if everything looks good!

