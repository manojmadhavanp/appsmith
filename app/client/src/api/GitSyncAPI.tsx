import type { AxiosPromise } from "axios";
import Api from "api/Api";
import type { ApiResponse } from "./ApiResponses";
import type { GitConfig } from "entities/GitSync";
import ApplicationApi from "@appsmith/api/ApplicationApi";

export interface CommitPayload {
  applicationId: string;
  commitMessage: string;
  doPush: boolean;
  branch: string;
}

export interface MergeBranchPayload {
  applicationId: string;
  sourceBranch: string;
  destinationBranch: string;
}

export interface MergeStatusPayload {
  applicationId: string;
  sourceBranch: string;
  destinationBranch: string;
}

export interface ConnectToGitPayload {
  remoteUrl: string;
  gitProfile?: {
    authorName: string;
    authorEmail: string;
    useDefaultProfile?: boolean;
  };
}

interface GitStatusParam {
  applicationId: string;
  branch: string;
  compareRemote: boolean;
}

interface GitRemoteStatusParam {
  applicationId: string;
  branch: string;
}

export enum AutocommitResponseEnum {
  IN_PROGRESS = "IN_PROGRESS",
  LOCKED = "LOCKED",
  PUBLISHED = "PUBLISHED",
  IDLE = "IDLE",
  NOT_REQUIRED = "NOT_REQUIRED",
  NON_GIT_APP = "NON_GIT_APP",
}

export interface GitAutocommitProgressResponse {
  autoCommitResponse: AutocommitResponseEnum;
  progress: number;
  branchName: string;
}

export interface GitTriggerAutocommitResponse {
  autoCommitResponse: AutocommitResponseEnum;
  progress: number;
  branchName: string;
}

class GitSyncAPI extends Api {
  static baseURL = `/v1/git`;

  static async commit({
    applicationId,
    branch,
    commitMessage,
    doPush,
  }: CommitPayload): Promise<AxiosPromise<ApiResponse>> {
    return Api.post(
      `${GitSyncAPI.baseURL}/commit/app/${applicationId}?branchName=${branch}`,
      {
        commitMessage,
        doPush,
      },
    );
  }

  static async merge({
    applicationId,
    destinationBranch,
    sourceBranch,
  }: MergeBranchPayload): Promise<AxiosPromise<ApiResponse>> {
    return Api.post(`${GitSyncAPI.baseURL}/merge/app/${applicationId}`, {
      sourceBranch,
      destinationBranch,
    });
  }

  static async getMergeStatus({
    applicationId,
    destinationBranch,
    sourceBranch,
  }: MergeStatusPayload) {
    return Api.post(`${GitSyncAPI.baseURL}/merge/status/app/${applicationId}`, {
      sourceBranch,
      destinationBranch,
    });
  }

  static async pull({ applicationId }: { applicationId: string }) {
    return Api.get(`${GitSyncAPI.baseURL}/pull/app/${applicationId}`);
  }

  static async connect(payload: ConnectToGitPayload, applicationId: string) {
    return Api.post(
      `${GitSyncAPI.baseURL}/connect/app/${applicationId}`,
      payload,
    );
  }

  static async getGlobalConfig() {
    return Api.get(`${GitSyncAPI.baseURL}/profile/default`);
  }

  static async setGlobalConfig(payload: GitConfig) {
    return Api.post(`${GitSyncAPI.baseURL}/profile/default`, payload);
  }

  static async fetchBranches(applicationId: string, pruneBranches?: boolean) {
    const queryParams = {} as { pruneBranches?: boolean };
    if (pruneBranches) queryParams.pruneBranches = true;
    return Api.get(
      `${GitSyncAPI.baseURL}/branch/app/${applicationId}`,
      queryParams,
    );
  }

  static async checkoutBranch(applicationId: string, branch: string) {
    return Api.get(
      `${GitSyncAPI.baseURL}/checkout-branch/app/${applicationId}`,
      {
        branchName: branch,
      },
    );
  }

  static async createNewBranch(applicationId: string, branch: string) {
    return Api.post(
      `${GitSyncAPI.baseURL}/create-branch/app/${applicationId}`,
      {
        branchName: branch,
      },
    );
  }

  static async getLocalConfig(applicationId: string) {
    return Api.get(`${GitSyncAPI.baseURL}/profile/app/${applicationId}`);
  }

  static async setLocalConfig(payload: GitConfig, applicationId: string) {
    return Api.put(
      `${GitSyncAPI.baseURL}/profile/app/${applicationId}`,
      payload,
    );
  }

  static async getGitStatus({
    applicationId,
    branch,
    compareRemote = true,
  }: GitStatusParam) {
    return Api.get(
      `${GitSyncAPI.baseURL}/status/app/${applicationId}`,
      { compareRemote },
      { headers: { branchName: branch } },
    );
  }

  static async getGitRemoteStatus({
    applicationId,
    branch,
  }: GitRemoteStatusParam) {
    return Api.get(
      `${GitSyncAPI.baseURL}/fetch/remote/app/${applicationId}`,
      {},
      { headers: { branchName: branch } },
    );
  }

  static async revokeGit({ applicationId }: { applicationId: string }) {
    return Api.post(`${GitSyncAPI.baseURL}/disconnect/app/${applicationId}`);
  }

  static async importApp(payload: ConnectToGitPayload, workspaceId: string) {
    return Api.post(`${GitSyncAPI.baseURL}/import/${workspaceId}`, payload);
  }

  static async getSSHKeyPair(
    applicationId: string,
  ): Promise<AxiosPromise<ApiResponse>> {
    return Api.get(ApplicationApi.baseURL + "/ssh-keypair/" + applicationId);
  }

  static async generateSSHKeyPair(
    applicationId: string,
    keyType: string,
    isImporting?: boolean,
  ): Promise<AxiosPromise<ApiResponse>> {
    const url = isImporting
      ? `v1/git/import/keys?keyType=${keyType}`
      : `${ApplicationApi.baseURL}/ssh-keypair/${applicationId}?keyType=${keyType}`;
    return isImporting ? Api.get(url) : Api.post(url);
  }

  static async deleteBranch(
    applicationId: string,
    branchName: string,
  ): Promise<AxiosPromise<ApiResponse>> {
    return Api.delete(GitSyncAPI.baseURL + "/branch/app/" + applicationId, {
      branchName,
    });
  }

  static async discardChanges(applicationId: string) {
    return Api.put(`${GitSyncAPI.baseURL}/discard/app/${applicationId}`);
  }

  static async getProtectedBranches(applicationId: string) {
    return Api.get(
      `${GitSyncAPI.baseURL}/branch/app/${applicationId}/protected`,
    );
  }

  static async updateProtectedBranches(
    applicationId: string,
    branchNames: string[],
  ) {
    return Api.post(
      `${GitSyncAPI.baseURL}/branch/app/${applicationId}/protected`,
      { branchNames },
    );
  }

  static async getGitMetadata(applicationId: string) {
    return Api.get(`${GitSyncAPI.baseURL}/metadata/app/${applicationId}`);
  }

  static async toggleAutocommit(applicationId: string) {
    return Api.patch(
      `${GitSyncAPI.baseURL}/auto-commit/toggle/app/${applicationId}`,
    );
  }

  static async triggerAutocommit(applicationId: string, branchName: string) {
    return Api.post(
      `${GitSyncAPI.baseURL}/auto-commit/app/${applicationId}?branchName=${branchName}`,
    );
  }

  static async getAutocommitProgress(applicationId: string) {
    return Api.get(
      `${GitSyncAPI.baseURL}/auto-commit/progress/app/${applicationId}`,
    );
  }
}

export default GitSyncAPI;
