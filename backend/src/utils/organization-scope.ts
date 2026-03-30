import { UserModel } from '../modules/user/user.model.js';

export async function getOrganizationUserIds(organizationId: string) {
  return UserModel.find({ organization: organizationId }).distinct('_id');
}
