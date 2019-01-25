module.exports = {
  userPermission(schema) {
    schema.methods.checkPerm = function(user, perm='read') {
      if (_.includes(ALLOWED_ROLES, user.role)) return true;

      if ((this.organization && this.organization === user.organization)
            && (user.is_owner || user.is_manager)) return true;

      let labelPerms = {
        read: ['labelsRead', 'labelsWrite'],
        write: ['labelsWrite']
      };

      let validLabels = [];
      for (let currentPerm of labelPerms[perm]) {
        let currentValidLabels = this[currentPerm] || [];
        validLabels.push(...currentValidLabels)
      }

      if (_.intersection(user.labels, validLabels).length > 0) return true;

      let perms = {
        read: ['read', 'write'],
        write: ['write']
      };

      let validUserIds = [];
      for (let currentPerm of perms[perm]) {
        let currentValidUserIds = _.map(this[currentPerm], u => u.uid.toString('hex'));
        validUserIds.push(...currentValidUserIds)
      }
      return _.includes(validUserIds, user.obj.uid.toString('hex'));
    }
  }
}
